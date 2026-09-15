import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { events } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// PATCH : Changer l'état "isCompleted" d'une session / événement
export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const eventId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const { isCompleted } = await request.json();

    db.update(events)
      .set({ isCompleted: Boolean(isCompleted) })
      .where(eq(events.id, eventId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PATCH /api/events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier les détails d'une session
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const eventId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const { title, date, description } = await request.json();

    db.update(events)
      .set({
        title,
        date,
        description: description || null,
      })
      .where(eq(events.id, eventId))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PUT /api/events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer une session
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const eventId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    db.delete(events).where(eq(events.id, eventId)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
