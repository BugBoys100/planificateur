import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { effortLevels, users } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const DEFAULT_LEVELS = [
  { name: '🌱 Léger', description: 'Environ 1 session par semaine', percentage: 15 },
  { name: '📘 Moyen', description: 'Répartition équilibrée (~30% du temps)', percentage: 30 },
  { name: '🔥 Intensif', description: 'Rythme soutenu (~60% du temps)', percentage: 60 },
  { name: '⚡️ Sprint', description: 'Travail quotidien jusqu’au rendu (100%)', percentage: 100 },
];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('API Levels: Aucun token dans les cookies');
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      console.log('API Levels: Token invalide');
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const userId = payload.id as string;
    const existingUser = db.select().from(users).where(eq(users.id, userId)).get();

    if (!existingUser) {
      console.log(`API Levels: Utilisateur ${userId} introuvable`);
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    let levels = db.select().from(effortLevels).where(eq(effortLevels.userId, userId)).all();

    if (levels.length === 0) {
      for (const lvl of DEFAULT_LEVELS) {
        db.insert(effortLevels).values({
          id: crypto.randomUUID(),
          userId,
          name: lvl.name,
          description: lvl.description,
          percentage: lvl.percentage,
        }).run();
      }
      levels = db.select().from(effortLevels).where(eq(effortLevels.userId, userId)).all();
    }

    return NextResponse.json(levels);
  } catch (error) {
    console.error('Erreur API Levels:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
