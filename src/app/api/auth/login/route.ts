import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/auth';
import { logAction } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. Chercher l'utilisateur
    const user = db.select().from(users).where(eq(users.username, username)).get();
    
    if (!user) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Identifiants incorrects.' }, { status: 401 });
    }


// Après validation du mot de passe...
await logAction({
  userId: user.id,
  userName: user.username,
  userEmail: "inconnue",
  action: 'USER_LOGIN',
  category: 'AUTH',
  details: `Connexion réussie (${user.username})`,
  request,
});


    // 3. Créer le token
    const token = await signToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    // 4. Placer le token dans un cookie ultra-sécurisé (CORRIGÉ ICI)
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
