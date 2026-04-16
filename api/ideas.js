export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pillar, platform, context } = req.body;

  if (!pillar || !platform) {
    return res.status(400).json({ error: 'Välj en pelare och en kanal' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-nyckel saknas' });
  }

  const pillarDescriptions = {
    'livet-hemma': 'Livet hemma — roomtours, inredning, hyresgästporträtt, korridorliv på Lappis, vardagen i en studentlägenhet',
    'kon-ansokan': 'Kön & ansökan — hur man söker bostad via SSSB, kötider, tips till nya studenter, "registrera dig idag"-budskap',
    'studentliv': 'Studentliv i Stockholm — studieplatser, studentekonomi, nyinflyttad i Stockholm, säsongsinnehåll, studenthack',
    'hallbarhet': 'Hållbarhet — Norra Djurgårdsstaden, miljöcertifieringar, hållbart boende, energi, sopsortering',
    'bakom-kulisserna': 'Bakom kulisserna — personal på SSSB, SSSB-dagar, trappkonst-tävlingen, löpgruppen, kultur',
    'organisation': 'Organisation & employer brand — rekrytering, NKI-resultat, konferenser, SSSB:s uppdrag som ideell organisation'
  };

  const platformGuides = {
    instagram: `Instagram (@sssb_studentbostader, 6 200 följare). Format: Reels, Karusell, Stories, Bild. Ton: varm, personlig, visuell. Emojis sparsamt. 3–5 hashtags. Målgrupp: studenter 18–28.`,
    tiktok: `TikTok (@sssb_studentbostader, 820 följare). Format: Kort video (15–60 sek). Ton: snabb hook, underhållande, autentisk. Trender och ljud. Målgrupp: 18–24 år.`,
    linkedin: `LinkedIn (Stockholms Studentbostäder SSSB). Format: Inlägg, Artikel, Dokument. Ton: professionell men vänlig, samhällsnytta, employer branding. Målgrupp: branschfolk, potentiella medarbetare, politiker.`
  };

  const prompt = `Du är innehållsstrateg åt SSSB (Stockholms Studentbostäder) — en ideell organisation som hyr ut bostäder till studenter i Stockholm.

Generera exakt 10 kreativa innehållsidéer för denna kombination:

INNEHÅLLSPELARE: ${pillarDescriptions[pillar] || pillar}
KANAL: ${platformGuides[platform] || platform}
${context ? `EXTRA KONTEXT: ${context}` : ''}

Varje idé ska innehålla:
- En kort, slagkraftig rubrik (max 8 ord)
- En hook — den första meningen/frågan som fångar uppmärksamheten
- Formatet (t.ex. Reels, Karusell, Stories, Video, Inlägg, Artikel)
- En kort beskrivning av innehållet (2–3 meningar)

Returnera BARA ett JSON-array i detta exakta format, utan förklaringar:
[
  {
    "title": "Rubrik här",
    "hook": "Den första meningen som fångar...",
    "format": "Reels",
    "description": "Kort beskrivning av vad inlägget visar..."
  }
]

Skriv alltid på svenska. Var kreativ, specifik och autentisk — inte generisk. Anpassa idéerna till SSSB:s verklighet och studenternas vardag i Stockholm.`;

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
        max_tokens: 2048,
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

    const ideas = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ ideas });

  } catch (err) {
    return res.status(500).json({ error: 'Något gick fel: ' + err.message });
  }
}
