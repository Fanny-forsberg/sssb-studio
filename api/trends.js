export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, platform } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-nyckel saknas' });
  }

  const platformGuide = {
    tiktok: 'TikTok (kort video 15–60 sek, snabb hook, ungdomligt, trender och ljud, 18–24 år)',
    instagram: 'Instagram Reels/Stories (visuellt, varm ton, emojis sparsamt, 18–28 år)',
    linkedin: 'LinkedIn (professionell men vänlig, samhällsnytta, employer branding)'
  }[platform] || 'TikTok';

  // Real trending data from web research (April 2026)
  const currentTrendsContext = `
AKTUELLA TRENDER JUST NU (april 2026 — använd dessa som bas):

TikTok-trender april 2026:
- "World Stop!" trend (before-and-after reveal) — @browsbyzulema audio, funkar för hem/rum/inredning
- "Not Meant to Live an Uncomfortable Life" — White Lotus-inspirerad, lyxig estetik, funkar för bostadsvisningar
- "God Forbid" trend — försvara sig mot kritik med humor
- "Hard Launch" — avslöja något (partner, rum, lägenhet) dramatiskt
- Coachella-content: GRWM, outfit breakdowns, festival-react
- Euphoria S3 reactions, audio pulls, outfit recreations
- "Loving Life Again" (Ella Langley) lipsync/b-roll trend
- "Self Aware" (Temper City) — dreamy scenery carousels, hot takes (434K+ videos)
- Beater Car Reveal (Tinashe "2 On" slowed) — kan anpassas till "beater room reveal"
- Color Walk — välj en färg, filma allt som matchar

Instagram Reels-trender april 2026:
- Split-Screen Carousels (vuxen vs barn-mindset) — höga save rates
- "Brainwash You" motivational hooks
- "Girl to Girl" format
- Gamified Reels (viewers som deltagare)
- Panoramic Reels (5120×1080)
- Seasonal spring transitions, outdoor walks
- Color-themed content

Studentboende-content som funkar:
- Roomtours och move-in content
- Midterm memes och studiehumor
- "Things I wish I knew before" studentlivet
- Kö-content (väntetider, tips, frustration)
- Autentiska studentröster > polerat varumärkesinnehåll
- Student ambassadors / micro-influencers
`;

  const prompt = `Du är trendexpert och innehållsstrateg åt SSSB (Stockholms Studentbostäder) — en ideell organisation som hyr ut bostäder till studenter i Stockholm. Konto: @sssb_studentbostader.

${currentTrendsContext}

Din uppgift: Ta aktuella trender och översätt dem till content SSSB kan använda.

${topic ? `Användaren söker efter: "${topic}"` : 'Ge mig de mest relevanta trenderna just nu.'}
Plattform: ${platformGuide}

Returnera exakt 5 trender som JSON-array. Välj trender som är SÄRSKILT relevanta för studentboende/studentliv/SSSB. Varje trend ska ha:

1. "trend_name" — Trendens namn
2. "trend_explanation" — Kort förklaring: varför den funkar, vad folk gör (2–3 meningar)
3. "relevance_score" — 1–5, hur relevant trenden är för SSSB (5 = perfekt match)
4. "relevance_reason" — Kort mening: varför denna trend passar SSSB
5. "sssb_adaptations" — Array med 2–3 konkreta SSSB-anpassningar
6. "video_idea" — Objekt med:
   - "hook" — Första meningen (max 10 ord)
   - "what_to_film" — Vad man filmar (2–3 meningar)
   - "text_overlay" — Text som visas på skärmen
   - "cta" — Call to action
7. "caption" — Färdig caption med 3–5 hashtags. Svenska men engelska trendnamn där det passar.

Sortera med högst relevance_score först.

Format: [...] Returnera BARA JSON.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Fel vid generering' });
    }

    const text = data.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Kunde inte tolka svaret' });
    }

    const trends = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ trends });

  } catch (err) {
    return res.status(500).json({ error: 'Något gick fel: ' + err.message });
  }
}
