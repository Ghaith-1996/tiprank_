import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    '';

  if (!uri) {
    return res.json({
      status: 'error',
      message: 'No MongoDB env var found',
      checked: ['MONGODB_URI', 'MONGO_URI', 'DATABASE_URL'],
      all_env_keys: Object.keys(process.env).sort(),
    });
  }

  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    const db = client.db();
    const analysts = await db.collection('analysts').countDocuments();
    const ratings = await db.collection('ratings').countDocuments();
    await client.close();

    return res.json({
      status: 'ok',
      dbName: db.databaseName,
      analysts,
      ratings,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'db_error',
      message: String(error),
      uriPrefix: uri.substring(0, 20) + '...',
    });
  }
}
