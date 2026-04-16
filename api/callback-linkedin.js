import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query;

  if (oauthError || !code) {
    return res.redirect(302, '/kopplingar.html?error=linkedin_denied');
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = `${process.env.BASE_URL || 'https://sssb-studio.vercel.app'}/api/callback-linkedin`;

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return res.redirect(302, '/kopplingar.html?error=linkedin_token');
    }

    const { access_token, expires_in, refresh_token } = tokenData;

    // Get profile info
    const profileRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const profile = await profileRes.json();
    const name = [profile.localizedFirstName, profile.localizedLastName].filter(Boolean).join(' ');

    // Try to get organization pages the user administers
    let orgName = '';
    let orgId = '';
    try {
      const orgRes = await fetch('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~(localizedName)))', {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      const orgData = await orgRes.json();
      const org = orgData.elements?.[0];
      if (org) {
        orgName = org['organizationalTarget~']?.localizedName || '';
        orgId = org.organizationalTarget?.replace('urn:li:organization:', '') || '';
      }
    } catch (e) {
      // Organization access is optional
    }

    // Save to Supabase
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    await db.from('social_connections').upsert({
      platform: 'linkedin',
      access_token,
      refresh_token: refresh_token || '',
      platform_account_id: orgId || profile.id || '',
      account_name: orgName || name || 'LinkedIn',
      extra: { personal_name: name, org_name: orgName, expires_in },
      connected_at: new Date().toISOString()
    }, { onConflict: 'platform' });

    res.redirect(302, '/kopplingar.html?success=linkedin');

  } catch (err) {
    console.error('LinkedIn callback error:', err);
    res.redirect(302, '/kopplingar.html?error=linkedin_fail');
  }
}
