import { NextRequest, NextResponse } from 'next/server';
import { getFPLBootstrapData } from '@/lib/fpl';

export async function POST(req: NextRequest) {
  try {
    const { prompt, manager, squad } = await req.json();
    const bootstrap = await getFPLBootstrapData();
    const apiKey = process.env.GEMINI_API_KEY;

    // Build rich context from the user's actual squad
    const squadContext = squad?.length > 0
      ? squad.map((p: any) => `${p.web_name} (${p.team_short}, ${['GK','DEF','MID','FWD'][p.element_type-1]}, £${(p.now_cost/10).toFixed(1)}m, Form:${p.form}, Pts:${p.total_points}, Ownership:${p.selected_by_percent}%${p.is_captain ? ', CAPTAIN' : ''}${p.is_vice_captain ? ', VICE-CAPTAIN' : ''}${p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 100 ? `, INJURY DOUBT (${p.chance_of_playing_next_round}% chance)` : ''}${p.news ? `, News: ${p.news}` : ''})`).join('\n')
      : 'No squad loaded yet.';

    // Top form players from bootstrap for broader context
    const topFormPlayers = bootstrap.players
      .sort((a: any, b: any) => parseFloat(b.form) - parseFloat(a.form))
      .slice(0, 20)
      .map((p: any) => `${p.web_name} (${p.team_short}, £${(p.now_cost/10).toFixed(1)}m, Form:${p.form}, Pts:${p.total_points}, Sel:${p.selected_by_percent}%)`)
      .join(', ');

    const systemPrompt = `You are an elite Fantasy Premier League (FPL) tactical analyst and AI copilot for the ${manager?.name || 'this'} FPL team managed by ${manager?.player_first_name || 'the manager'}.

CURRENT GAMEWEEK: ${bootstrap.currentEvent}
MANAGER STATS: Overall Points: ${manager?.summary_overall_points || 'N/A'} | Overall Rank: #${manager?.summary_overall_rank?.toLocaleString() || 'N/A'} | Bank: £${((manager?.last_deadline_bank || 0)/10).toFixed(1)}m | Team Value: £${((manager?.last_deadline_value || 0)/10).toFixed(1)}m

USER'S 15-MAN SQUAD:
${squadContext}

TOP FORM PLAYERS IN FPL RIGHT NOW:
${topFormPlayers}

You are an expert FPL advisor. Answer the manager's question with specific, actionable advice based on THEIR squad, THEIR budget, and LIVE FPL data. Use concrete player names and stats. Be concise but thorough. Think like a top 10k FPL manager. You can answer ANY question — about transfers, captaincy, chips, differentials, specific players, formations, injuries, fixtures, strategy — not just predefined topics.`;

    // If Gemini API key is available, attempt to use it with graceful fallback
    if (apiKey && apiKey.trim() !== "") {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const result = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `${systemPrompt}\n\nManager's question: ${prompt}`,
        });
        const responseText = result.text;
        if (responseText) {
          return NextResponse.json({ success: true, response: responseText, powered_by: 'gemini' });
        }
      } catch (genaiErr: any) {
        try {
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(apiKey.trim());
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent([
            { text: systemPrompt },
            { text: `Manager's question: ${prompt}` }
          ]);
          const response = result.response.text();
          return NextResponse.json({ success: true, response, powered_by: 'gemini' });
        } catch (legacyErr: any) {
          console.warn('Gemini API call failed, using intelligent squad fallback:', legacyErr?.message);
        }
      }
    }

    // Intelligent fallback without Gemini — use real squad or top form players
    const lower = (prompt || '').toLowerCase();
    const allPlayers = squad && squad.length > 0 ? squad : bootstrap.players.slice(0, 30);
    const starters = allPlayers.filter((p: any) => p.is_starting);
    const sortedByForm = [...allPlayers].sort((a: any, b: any) => parseFloat(b.form || '0') - parseFloat(a.form || '0'));
    const captain = (squad && squad.find((p: any) => p.is_captain)) || sortedByForm[0];
    const injured = allPlayers.filter((p: any) => p.chance_of_playing_next_round !== null && p.chance_of_playing_next_round < 100);
    const lowestForm = [...allPlayers].filter(p => p.element_type !== 1).sort((a: any, b: any) => parseFloat(a.form || '0') - parseFloat(b.form || '0'))[0];
    
    // Find best transfer target from live bootstrap
    const buyTarget = bootstrap.players
      .filter((p: any) => lowestForm && p.element_type === lowestForm.element_type && p.id !== lowestForm.id && p.now_cost <= (lowestForm.now_cost + (manager?.last_deadline_bank || 10)) && parseFloat(p.form) > 5.0)
      .sort((a: any, b: any) => parseFloat(b.form) - parseFloat(a.form))[0];

    let response = '';
    if (lower.includes('captain') || lower.includes('armband')) {
      const differential = sortedByForm.find((p: any) => parseFloat(p.selected_by_percent || '100') < 30 && p.id !== captain?.id);
      response = `📌 **Captaincy Recommendation — GW${bootstrap.currentEvent}**\n\n**Safe Pick:** ${captain?.web_name} (${captain?.team_short}) — Form: ${captain?.form} | ${captain?.total_points} pts total\n\n${differential ? `**Differential:** ${differential.web_name} (${differential.team_short}) — Only ${differential.selected_by_percent}% ownership. High upside if he delivers.\n\n` : ''}Add your Gemini API key to unlock full AI-powered analysis with fixture difficulty, expected points, and rival EO tracking.`;
    } else if (lower.includes('transfer') || lower.includes('sell') || lower.includes('buy')) {
      response = `🔄 **Transfer Recommendation — GW${bootstrap.currentEvent}**\n\n**Sell:** ${lowestForm?.web_name || 'Underperformer'} (${lowestForm?.team_short}) — Form: ${lowestForm?.form || '0.0'}${injured.length > 0 ? `\n⚠️ Injury doubts: ${injured.map((p: any) => `${p.web_name} (${p.chance_of_playing_next_round}%)`).join(', ')}` : ''}\n\n**Buy:** ${buyTarget?.web_name || 'N/A'} (${buyTarget?.team_short || 'PL'}) — Form: ${buyTarget?.form} | £${(buyTarget?.now_cost/10).toFixed(1)}m\n\n💳 Bank: £${((manager?.last_deadline_bank || 0)/10).toFixed(1)}m\n\nAdd your Gemini API key for full AI fixture analysis and transfer impact scoring.`;
    } else if (lower.includes('chip') || lower.includes('wildcard') || lower.includes('free hit') || lower.includes('bench boost') || lower.includes('triple captain')) {
      response = `🃏 **Chip Strategy — GW${bootstrap.currentEvent}**\n\n• **Wildcard:** Best used during fixture swings or before a Double Gameweek run. Don't waste it now unless your squad is broken.\n• **Triple Captain:** Deploy when your captain has an easy home match in a confirmed Double GW.\n• **Bench Boost:** Save for a Blank GW with 11 players with good fixtures.\n• **Free Hit:** Use in Blank GWs when many of your players don't have a fixture.\n\nAdd your Gemini API key for a personalized chip strategy based on your exact squad.`;
    } else if (lower.includes('differential') || lower.includes('budget') || lower.includes('cheap')) {
      const diffs = bootstrap.players
        .filter((p: any) => p.now_cost <= 75 && parseFloat(p.selected_by_percent) < 15 && parseFloat(p.form) >= 4.5)
        .sort((a: any, b: any) => parseFloat(b.form) - parseFloat(a.form))
        .slice(0, 5);
      response = `💡 **Budget Differentials (< £7.5m, < 15% ownership)**\n\n${diffs.map((p: any, i: number) => `${i+1}. **${p.web_name}** (${p.team_short}) — £${(p.now_cost/10).toFixed(1)}m | Form: ${p.form} | ${p.selected_by_percent}% owned`).join('\n') || 'No strong differentials found right now.'}\n\nAdd your Gemini API key for fixture-adjusted expected value rankings.`;
    } else {
      // Generic squad health check using real data
      response = `🏥 **Squad Health Check — GW${bootstrap.currentEvent}**\n\n${starters.length > 0 ? `**Your XI:** ${starters.map((p: any) => p.web_name).join(', ')}` : 'No squad loaded — enter your Team ID to sync.'}\n\n${injured.length > 0 ? `⚠️ **Injury Doubts:** ${injured.map((p: any) => `${p.web_name} (${p.chance_of_playing_next_round}% fit)`).join(', ')}` : '✅ No injury concerns detected.'}\n\n**Top Performer:** ${sortedByForm[0]?.web_name || 'N/A'} (Form: ${sortedByForm[0]?.form || 'N/A'})\n\nAdd your Gemini API key to unlock the full AI copilot — ask me anything about transfers, captains, fixtures, rivals, and strategy!`;
    }
    
    return NextResponse.json({ success: true, response, powered_by: 'fallback' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
