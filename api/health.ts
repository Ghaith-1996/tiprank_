import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const checks: Record<string, unknown> = {
    envSet: !!process.env.MONGODB_URI,
    timestamp: new Date().toISOString(),
  };

  try {
    const db = await getDb();
    const analystCount = await db.collection('analysts').countDocuments();
    const ratingCount = await db.collection('ratings').countDocuments();

    checks.db = 'connected';
    checks.dbName = db.databaseName;
    checks.analysts = analystCount;
    checks.ratings = ratingCount;

    return res.json({ status: 'ok', ...checks });
  } catch (error) {
    checks.db = 'failed';
    checks.error = String(error);
    return res.status(500).json({ status: 'error', ...checks });
  }
}
