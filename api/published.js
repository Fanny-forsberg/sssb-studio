import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  if (req.method === 'GET') {
    // Get all published posts, optionally filtered by month
    const month = req.query.month; // e.g. "2026-05"

    let query = db
      .from('published_posts')
      .select('id, platform, post_text, post_link, media_type, published_at, matched_plan_id')
      .order('published_at', { ascending: false });

    if (month) {
      const start = `${month}-01T00:00:00Z`;
      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + 1);
      query = query.gte('published_at', start).lt('published_at', endDate.toISOString());
    }

    const { data, error } = await query.limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ posts: data || [] });
  }

  // PATCH: manually match a published post to a planned post
  if (req.method === 'PATCH') {
    const { id, matched_plan_id } = req.body;
    if (!id) return res.status(400).json({ error: 'id krävs' });

    const { error } = await db
      .from('published_posts')
      .update({ matched_plan_id })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
