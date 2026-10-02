import { createRemoteJWKSet, jwtVerify } from 'jose';

// Proxy gratuito a Workers AI. Solo responde a usuarios de Firebase de la lista ALLOWED_EMAILS.
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
const MODEL = '@cf/openai/gpt-oss-120b';

// Distintos modelos devuelven el texto en distintos sitios.
const textOf = (out) =>
  out.response ??
  out.choices?.[0]?.message?.content ??
  out.output?.flatMap(o => o.content ?? []).map(c => c.text).filter(Boolean).join('');

export default {
  async fetch(request, env) {
    const origins = env.ALLOWED_ORIGINS.split(',');
    const origin = request.headers.get('Origin');
    const cors = {
      'Access-Control-Allow-Origin': origins.includes(origin) ? origin : origins[0],
      Vary: 'Origin',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return reply({ error: 'method' }, 405);

    try {
      const token = (request.headers.get('Authorization') || '').replace('Bearer ', '');
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
        audience: env.FIREBASE_PROJECT_ID,
      });
      if (!env.ALLOWED_EMAILS.split(',').includes(payload.email)) return reply({ error: 'forbidden' }, 403);
    } catch {
      return reply({ error: 'unauthorized' }, 401);
    }

    try {
      const { messages } = await request.json();
      if (!Array.isArray(messages) || JSON.stringify(messages).length > 8000) return reply({ error: 'bad request' }, 400);

      // max_tokens alto: los modelos de razonamiento gastan parte "pensando".
      const out = await env.AI.run(MODEL, { messages, max_tokens: 3000, temperature: 0.3 });
      const text = textOf(out);
      if (!text) return reply({ error: `respuesta vacía (${Object.keys(out)})` }, 502);
      return reply({ text });
    } catch (err) {
      return reply({ error: String(err.message || err) }, 500);
    }
  },
};
