import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = process.env.NEXT_PUBLIC_URL_ASN_LINES;
  const apiKey = process.env.NEXT_PUBLIC_X_API_KEY;

  try {
    const response = await fetch(backendUrl!, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey!,
      },
      body: ['POST', 'PATCH', 'PUT'].includes(req.method!) ? JSON.stringify(req.body) : undefined,
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
