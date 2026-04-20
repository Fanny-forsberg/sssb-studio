export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, description, start_date, end_date, platforms, budget } = req.body;

  if (!name || !description || !start_date || !end_date || !platforms?.length) {
    return res.status(400).json({ error: 'Fyll i kampanjnamn, beskrivning, datum och minst en kanal.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-nyckel saknas' });
  }

  const budgetLabels = {
    'none': 'Ingen budget (organiskt)',
    'small': 'Liten budget (<5 000 kr)',
    'medium': 'Medel budget (5 000–20 000 kr)',
    'large': 'Stor budget (>20 000 kr)'
  };

  const platformNames = platforms.map(p => {
    if (p === 'instagram') return 'Instagram';
    if (p === 'tiktok') return 'TikTok';
    if (p === 'linkedin') return 'LinkedIn';
    return p;
  });

  const prompt = `Du är kampanjstrateg åt SSSB (Stockholms Studentbostäder) — en ideell organisation som hyr ut bostäder till studenter i Stockholm.

Skapa en detaljerad kampanjplan baserat på:

KAMPANJNAMN: ${name}
MÅL & BESKRIVNING: ${description}
PERIOD: ${start_date} till ${end_date}
KANALER: ${platformNames.join(', ')}
BUDGET: ${budgetLabels[budget] || 'Ingen budget'}

Inkludera:
1. En övergripande strategi (2–3 meningar)
2. En veckovis timeline med specifika inlägg per kanal. Varje inlägg ska ha: plattform, format (Reels/Video/Karusell/Stories/Inlägg), ämne/topic, och en hook (första meningen som fångar uppmärksamhet)
3. En sammanfattande checklista med allt som behöver förberedas

Returnera BARA ett JSON-objekt i detta exakta format, utan förklaringar:
{
  "strategy": "Övergripande strategi här...",
  "weeks": [
    {
      "week": 1,
      "theme": "Veckotema här",
      "posts": [
        {
          "platform": "Instagram",
          "format": "Reels",
          "topic": "Vad inlägget handlar om",
          "hook": "Den första meningen som fångar..."
        }
      ]
    }
  ],
  "checklist": [
    "Punkt 1",
    "Punkt 2"
  ]
}

Skriv alltid på svenska. Var kreativ, specifik och autentisk — inte generisk. Anpassa till SSSB:s verklighet och studenternas vardag i Stockholm. Skapa en realistisk mängd inlägg per vecka (2–4 per kanal).`;

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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Kunde inte tolka svaret' });
    }

    const campaign = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ campaign });

  } catch (err) {
    return res.status(500).json({ error: 'Något gick fel: ' + err.message });
  }
}
