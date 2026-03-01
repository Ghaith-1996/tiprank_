import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const db = await getDb();
    const analysts = await db.collection('analysts').countDocuments();
    const ratings = await db.collection('ratings').countDocuments();

    return res.json({
      status: 'ok',
      dbName: db.databaseName,
      analysts,
      ratings,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: String(error),
    });
  }
}
