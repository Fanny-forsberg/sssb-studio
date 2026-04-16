import crypto from 'crypto';

// Redirect user to LinkedIn OAuth
export default function handler(req, res) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'LINKEDIN_CLIENT_ID saknas i miljövariabler' });
  }

  const redirectUri = `${process.env.BASE_URL || 'https://sssb-studio.vercel.app'}/api/callback-linkedin`;
  const state = crypto.randomBytes(16).toString('hex');
  const scopes = 'r_organization_social rw_organization_admin w_member_social r_basicprofile';

  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scopes)}`;

  res.redirect(302, url);
}
