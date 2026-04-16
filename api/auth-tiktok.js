import crypto from 'crypto';

// Redirect user to TikTok OAuth
export default function handler(req, res) {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    return res.status(500).json({ error: 'TIKTOK_CLIENT_KEY saknas i miljövariabler' });
  }

  const redirectUri = `${process.env.BASE_URL || 'https://sssb-studio.vercel.app'}/api/callback-tiktok`;
  const csrfState = crypto.randomBytes(16).toString('hex');
  const scopes = 'user.info.basic,video.list';

  const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scopes}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${csrfState}`;

  res.redirect(302, url);
}
