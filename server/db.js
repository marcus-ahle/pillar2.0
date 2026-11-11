import { MongoClient } from 'mongodb';
import { config } from './config.js';

let client;

/** Shared connection to the site database (programs, events, sponsors, settings). */
export async function getDb() {
  if (!client) {
    client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
  }
  return client.db(config.dbName);
}

export async function closeDb() {
  if (client) await client.close();
  client = undefined;
}
