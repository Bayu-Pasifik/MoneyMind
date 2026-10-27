// Cloudflare Worker that forwards receipt images to OCR.space so the API key
// stays server-side (set with `wrangler secret put OCR_SPACE_API_KEY`) instead
// of being bundled into the mobile app.

const OCR_SPACE_ENDPOINT = 'https://api.ocr.space/parse/image';
const MAX_BODY_BYTES = 2 * 1024 * 1024;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    if (!env.OCR_SPACE_API_KEY) return json({ error: 'Server not configured' }, 500);

    const length = Number(request.headers.get('content-length') ?? 0);
    if (length > MAX_BODY_BYTES) return json({ error: 'Image too large' }, 413);

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const base64Image = payload?.base64Image;
    if (typeof base64Image !== 'string' || !base64Image.startsWith('data:image/')) {
      return json({ error: 'base64Image must be a data:image/* URI' }, 400);
    }
    if (base64Image.length > MAX_BODY_BYTES) return json({ error: 'Image too large' }, 413);

    const form = new FormData();
    form.append('apikey', env.OCR_SPACE_API_KEY);
    form.append('base64Image', base64Image);
    form.append('language', 'eng');
    form.append('OCREngine', '2');
    form.append('scale', 'true');
    form.append('isTable', 'true');

    const upstream = await fetch(OCR_SPACE_ENDPOINT, { method: 'POST', body: form });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    });
  },
};
