import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_URL_ASN_HEADERS;
  const apiKey = process.env.NEXT_PUBLIC_X_API_KEY;

  try {
    // Debug log: show incoming payload
    if (req.method === 'POST') {
      console.log('ASN Header API route received payload:', req.body);
      // Validate id is a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(req.body.id)) {
        return res.status(400).json({ error: 'ASN header id must be a valid UUID', received: req.body.id });
      }
    }
    const response = await fetch(backendUrl!, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey!,
      },
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      res.status(response.status).json(data);
    } else {
      data = await response.text();
      res.status(response.status).send(data);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
