import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    // 1. Extraction du cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé (token manquant)' }, { status: 401 });
    }

    // 2. Vérification du Token
    let payload: any = null;
    try {
      payload = await verifyToken(token);
    } catch (tokenErr: any) {
      console.error('Erreur dans verifyToken:', tokenErr);
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    if (!payload || typeof payload !== 'object' || !payload.id) {
      return NextResponse.json({ error: 'Payload du token invalide' }, { status: 401 });
    }

    // 3. Requête Base de Données
    const userId = String(payload.id);
    let userResult: any[] = [];
    const user = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, userId),
  columns: {
    id: true,
    name: true,
    email: true,
  },
});

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable en BDD' }, { status: 404 });
    }

    // 4. Renvoi du résultat
    return NextResponse.json({
      id: user.id ?? '',
      name: user.name ?? '',
      email: user.email ?? '',
    });

  } catch (error: any) {
    console.error('=== TRACE ERREUR FATALE GET /api/user/settings ===', error);
    return NextResponse.json(
      { error: `Erreur serveur: ${error?.message || 'Problème inconnu'}` }, 
      { status: 500 }
    );
  }
}
