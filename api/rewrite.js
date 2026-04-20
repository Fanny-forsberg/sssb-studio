export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, platforms } = req.body;

  if (!text || !platforms || platforms.length === 0) {
    return res.status(400).json({ error: 'Text och minst en kanal krävs' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-nyckel saknas' });
  }

  const validPlatforms = ['instagram', 'tiktok', 'linkedin'];
  const selectedPlatforms = platforms.filter(p => validPlatforms.includes(p));

  if (selectedPlatforms.length === 0) {
    return res.status(400).json({ error: 'Ingen giltig kanal vald' });
  }

  const systemPrompt = `Du är social media-expert åt SSSB (Stockholms Studentbostäder). Ta texten och anpassa den till varje kanal. Instagram: varm, personlig, 3-5 hashtags, emojis sparsamt. TikTok: kort, snabb hook, ungdomligt, max 150 ord, 3-5 hashtags. LinkedIn: professionell men vänlig, samhällsnytta, inga/max 2 hashtags.

Returnera BARA ett JSON-objekt i detta exakta format, utan förklaringar eller markdown:
{
  ${selectedPlatforms.map(p => `"${p}": "anpassad caption här"`).join(',\n  ')}
}

Skriv alltid på svenska.`;

  const userPrompt = `Anpassa följande text till ${selectedPlatforms.map(p => p === 'linkedin' ? 'LinkedIn' : p === 'tiktok' ? 'TikTok' : 'Instagram').join(', ')}:\n\n${text}`;

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
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'Fel vid generering' });
    }

    const responseText = data.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Kunde inte tolka svaret' });
    }

    const captions = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ captions });

  } catch (err) {
    return res.status(500).json({ error: 'Något gick fel: ' + err.message });
  }
}
