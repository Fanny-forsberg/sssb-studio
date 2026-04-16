import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kndadtevenphkiotunlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZGFkdGV2ZW5waGtpb3R1bmxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTEzMjAsImV4cCI6MjA5MTg4NzUyMH0.fTfFxbG7z1wjgqIa-jAnMqiHBlWG5KzTIPDE1Qh79gg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform, caption, scheduled_date, scheduled_time, topic } = req.body;

  if (!platform || !caption) {
    return res.status(400).json({ error: 'platform och caption krävs' });
  }

  // If Later webhook is configured, forward to it
  const laterWebhook = process.env.LATER_WEBHOOK_URL;
  if (laterWebhook) {
    try {
      await fetch(laterWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          caption,
          scheduled_date,
          scheduled_time,
          topic
        })
      });
    } catch (e) {
      console.error('Later webhook failed:', e);
    }
  }

  // Also save to Supabase for history
  try {
    const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await db.from('scheduled_posts').insert({
      platform,
      caption,
      topic: topic || '',
      scheduled_for: scheduled_date ? `${scheduled_date}T${scheduled_time || '10:00'}:00` : null,
      status: laterWebhook ? 'sent_to_later' : 'draft'
    });
  } catch (e) {
    // Supabase not available — that's ok
  }

  return res.status(200).json({ ok: true, sent_to_later: !!laterWebhook });
}
