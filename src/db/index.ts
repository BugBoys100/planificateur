import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Le fichier SQLite sera stocké à la racine du projet
const dbPath = path.resolve(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);

// On exporte l'instance de la base de données typée avec notre schéma
export const db = drizzle(sqlite, { schema });
