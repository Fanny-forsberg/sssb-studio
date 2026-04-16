import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError || !code) {
    return res.redirect(302, '/kopplingar.html?error=tiktok_denied');
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${process.env.BASE_URL || 'https://sssb-studio.vercel.app'}/api/callback-tiktok`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.data?.access_token) {
      return res.redirect(302, '/kopplingar.html?error=tiktok_token');
    }

    const { access_token, open_id, refresh_token, expires_in } = tokenData.data;

    // Get user info
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,follower_count,avatar_url', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const userData = await userRes.json();
    const user = userData.data?.user || {};

    // Save to Supabase
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    await db.from('social_connections').upsert({
      platform: 'tiktok',
      access_token,
      refresh_token: refresh_token || '',
      platform_account_id: open_id || '',
      account_name: user.display_name || 'TikTok',
      extra: { followers: user.follower_count, avatar: user.avatar_url, expires_in },
      connected_at: new Date().toISOString()
    }, { onConflict: 'platform' });

    res.redirect(302, '/kopplingar.html?success=tiktok');

  } catch (err) {
    console.error('TikTok callback error:', err);
    res.redirect(302, '/kopplingar.html?error=tiktok_fail');
  }
}
