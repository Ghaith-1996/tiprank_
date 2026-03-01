import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

let cached: { client: MongoClient; promise: Promise<MongoClient> } | null = null;

export async function getDb() {
  if (!cached) {
    const client = new MongoClient(uri);
    cached = { client, promise: client.connect() };
  }
  await cached.promise;
  return cached.client.db();
}
