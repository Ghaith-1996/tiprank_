import type { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient } from 'mongodb';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || '';

  if (!uri) {
    return res.json({ status: 'error', message: 'No MongoDB env var found' });
  }

  try {
    const client = await new MongoClient(uri).connect();
    const db = client.db();
    const analysts = await db.collection('analysts').countDocuments();
    const ratings = await db.collection('ratings').countDocuments();
    await client.close();

    return res.json({ status: 'ok', dbName: db.databaseName, analysts, ratings });
  } catch (error) {
    return res.status(500).json({ status: 'db_error', message: String(error) });
  }
}
