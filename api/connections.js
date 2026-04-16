import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    // Return connection status (no tokens exposed)
    const { data, error } = await db
      .from('social_connections')
      .select('platform, account_name, extra, connected_at');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const connections = {};
    (data || []).forEach(row => {
      connections[row.platform] = {
        connected: true,
        account_name: row.account_name,
        followers: row.extra?.followers,
        connected_at: row.connected_at
      };
    });

    return res.status(200).json({ connections });
  }

  if (req.method === 'DELETE') {
    const { platform } = req.body || req.query;
    if (!platform) {
      return res.status(400).json({ error: 'Platform krävs' });
    }

    const { error } = await db
      .from('social_connections')
      .delete()
      .eq('platform', platform);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
