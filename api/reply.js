export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, platform } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Meddelande krävs' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API-nyckel saknas' });
  }

  const prompt = `Du är community manager åt SSSB (Stockholms Studentbostäder). Du har fått följande meddelande och ska ge 3 svarsförslag med olika ton: vänlig, professionell, casual.

SSSB:s ton: varm, hjälpsam, aldrig fånig. Svara på svenska.

Meddelande: "${message}"
Typ: ${context || 'Kommentar (public)'}
Plattform: ${platform || 'Instagram'}

Returnera BARA ett JSON-objekt i detta exakta format, utan förklaringar:
{
  "replies": [
    { "tone": "Vänlig", "text": "svarstext här" },
    { "tone": "Professionell", "text": "svarstext här" },
    { "tone": "Casual", "text": "svarstext här" }
  ]
}

Anpassa längd och stil efter plattform. Håll svaren koncisa och relevanta.`;

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

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: 'Något gick fel: ' + err.message });
  }
}
