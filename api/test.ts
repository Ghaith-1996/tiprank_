import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.json({
    ok: true,
    node: process.version,
    env_keys: Object.keys(process.env).filter(
      (k) => k.includes('MONGO') || k.includes('DATABASE'),
    ),
  });
}
