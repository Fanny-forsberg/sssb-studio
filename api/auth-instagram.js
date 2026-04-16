// Redirect user to Instagram/Meta OAuth
export default function handler(req, res) {
  const clientId = process.env.META_APP_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'META_APP_ID saknas i miljövariabler' });
  }

  const redirectUri = `${process.env.BASE_URL || 'https://sssb-studio.vercel.app'}/api/callback-instagram`;
  const scopes = [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',');

  const url = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;

  res.redirect(302, url);
}
