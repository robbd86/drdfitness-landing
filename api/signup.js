const allowedOrigins = new Set([
  'https://drdfitness.co.uk',
  'https://www.drdfitness.co.uk',
  'https://drdfitness-landing.vercel.app'
]);

function setCors(res, origin) {
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function looksLikeEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ''));
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = String(body?.email || '').trim();

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!looksLikeEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // For now, we accept and log. Connect to an email provider later.
    console.log('Cut plan signup:', {
      email,
      source: body?.source,
      results: body?.results,
      inputs: body?.inputs,
      createdAt: body?.createdAt
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
}
