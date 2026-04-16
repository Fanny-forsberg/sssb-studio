import { createClient } from '@supabase/supabase-js';

// Uses the same anon key as the frontend — no extra env vars needed
const SUPABASE_URL = 'https://kndadtevenphkiotunlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZGFkdGV2ZW5waGtpb3R1bmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTEzMjAsImV4cCI6MjA5MTg4NzUyMH0.fTfFxbG7z1wjgqIa-jAnMqiHBlWG5KzTIPDE1Qh79gg';

export default async function handler(req, res) {
  // Zapier tests with GET
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform, text, link, published_at, media_type } = req.body;

  if (!platform) {
    return res.status(400).json({ error: 'platform krävs' });
  }

  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await db.from('published_posts').insert({
    platform: platform.toLowerCase(),
    post_text: text || '',
    post_link: link || '',
    media_type: media_type || '',
    published_at: published_at || new Date().toISOString()
  }).select().single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ ok: true, id: data.id });
}
