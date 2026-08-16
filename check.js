// api/check.js — Vercel serverless function
// Pwoksi ki kache kle BANCHECK_KEY la sou sèvè a (jamè li pa antre nan navigatè)
// Kle a dwe konfigire nan Vercel: Settings -> Environment Variables -> BANCHECK_KEY

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { number } = req.body || {};
  if (!number) {
    return res.status(400).json({ error: 'number is required' });
  }

  const BANCHECK_KEY = process.env.BANCHECK_KEY;
  if (!BANCHECK_KEY) {
    console.error('BANCHECK_KEY manke nan environment variables Vercel yo');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const bcRes = await fetch('https://baron0.com/api/v2/check', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BANCHECK_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number }),
    });

    const body = await bcRes.json().catch(() => ({}));

    if (!bcRes.ok) {
      return res.status(bcRes.status).json({
        error: body.detail || body.error || 'Upstream error',
      });
    }

    // Nou voye sèlman sa frontend lan bezwen — pa expoze tout repons brit la
    return res.status(200).json({
      banned: !!body.banned,
      status: body.status || null,
      message: body.message || null,
    });
  } catch (err) {
    console.error('BanCheck upstream error:', err);
    return res.status(502).json({ error: 'Upstream error' });
  }
}
