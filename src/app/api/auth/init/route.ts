import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // 1. Vérifier s'il existe déjà des utilisateurs
    const existingUsers = db.select().from(users).all();
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'Initialisation déjà effectuée.' }, { status: 403 });
    }

    const { username, password } = await request.json();

    if (!username || !password || password.length < 6) {
      return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 400 });
    }

    // 2. Hacher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Créer l'utilisateur Administrateur
    db.insert(users).values({
      id: crypto.randomUUID(),
      username,
      passwordHash,
      role: 'admin',
      canViewLogs: true,
    }).run();

    return NextResponse.json({ success: true, message: 'Compte administrateur créé avec succès.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
