import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDb() {
  if (!uri) {
    return null;
  }

  if (!clientPromise) {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise ?? null;
    } else {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }
  }

  if (!clientPromise) {
    return null;
  }

  const connectedClient = await clientPromise;
  return connectedClient.db('nightfly');
}
