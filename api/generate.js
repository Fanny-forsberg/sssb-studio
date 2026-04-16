export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, platforms, context } = req.body;

  if (!topic || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Ämne och minst en kanal krävs' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-nyckel saknas' });
  }

  const platformInstructions = {
    instagram: `Instagram (max 2200 tecken, använd emojis sparsamt, 3–5 relevanta hashtags, varm och personlig ton, riktat till studenter 18–28 år)`,
    tiktok: `TikTok (kort och engagerande, börja med en hook som fångar direkt, använd ungdomligt språk, max 150 ord, 3–5 hashtags inklusive #studentliv)`,
    linkedin: `LinkedIn (professionell men vänlig ton, fokus på SSSB som organisation och samhällsnytta, 150–300 ord, inga hashtags eller max 2 st)`
  };

  const selectedPlatforms = platforms.filter(p => platformInstructions[p]);

  const prompt = `Du är social media-ansvarig på SSSB (Stockholms Studentbostäder) — en ideell organisation som hyr ut bostäder till studenter i Stockholm. Er målgrupp är studenter 18–28 år. Er ton är varm, hjälpsam och modern men aldrig fånig.

Skriv en caption till följande kanaler baserat på ämnet nedan.

Ämne: ${topic}
${context ? `Extra kontext: ${context}` : ''}

Skriv en caption för varje kanal. Returnera BARA ett JSON-objekt i detta exakta format, utan förklaringar:
{
  ${selectedPlatforms.map(p => `"${p}": "caption-text här"`).join(',\n  ')}
}

Kanaler och instruktioner:
${selectedPlatforms.map(p => `- ${platformInstructions[p]}`).join('\n')}

Skriv alltid på svenska. Var autentisk och undvik klichéer.`;

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
        max_tokens: 1024,
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

    const captions = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ captions });

  } catch (err) {
    return res.status(500).json({ error: 'Något gick fel: ' + err.message });
  }
}
