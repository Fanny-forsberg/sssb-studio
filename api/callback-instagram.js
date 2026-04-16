import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError || !code) {
    return res.redirect(302, '/kopplingar.html?error=instagram_denied');
  }

  const clientId = process.env.META_APP_ID;
  const clientSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.BASE_URL || 'https://sssb-studio.vercel.app'}/api/callback-instagram`;

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.redirect(302, '/kopplingar.html?error=instagram_token');
    }

    // Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`
    );
    const longData = await longRes.json();
    const accessToken = longData.access_token || tokenData.access_token;

    // Get Instagram Business Account ID via connected pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account,name&access_token=${accessToken}`
    );
    const pagesData = await pagesRes.json();

    const page = pagesData.data?.find(p => p.instagram_business_account);
    const igAccountId = page?.instagram_business_account?.id;

    // Get basic IG profile info
    let igUsername = '';
    let igFollowers = 0;
    if (igAccountId) {
      const profileRes = await fetch(
        `https://graph.facebook.com/v21.0/${igAccountId}?fields=username,followers_count&access_token=${accessToken}`
      );
      const profile = await profileRes.json();
      igUsername = profile.username || '';
      igFollowers = profile.followers_count || 0;
    }

    // Save to Supabase
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    await db.from('social_connections').upsert({
      platform: 'instagram',
      access_token: accessToken,
      platform_account_id: igAccountId || '',
      account_name: igUsername ? `@${igUsername}` : page?.name || 'Instagram',
      extra: { followers: igFollowers, page_id: page?.id },
      connected_at: new Date().toISOString()
    }, { onConflict: 'platform' });

    res.redirect(302, '/kopplingar.html?success=instagram');

  } catch (err) {
    console.error('Instagram callback error:', err);
    res.redirect(302, '/kopplingar.html?error=instagram_fail');
  }
}
