import { MongoClient } from 'mongodb';

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  '';

if (!uri) {
  console.error(
    'Missing MongoDB connection string. Set MONGODB_URI environment variable.',
  );
}

let cached: { client: MongoClient; promise: Promise<MongoClient> } | null =
  null;

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (!cached) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    cached = { client, promise: client.connect() };
  }

  await cached.promise;
  return cached.client.db();
}
