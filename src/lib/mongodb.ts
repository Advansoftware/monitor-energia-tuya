import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI || 'mongodb://192.168.3.13:27017/energia_monitor';

  if (!uri) {
    throw new Error('MONGODB_URI não definida no arquivo de ambiente');
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    const db = client.db('energia_monitor');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    throw error;
  }
}