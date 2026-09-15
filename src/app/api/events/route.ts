import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { events, projects } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';

// GET : Récupérer tous les événements de l'utilisateur (libres + liés à ses projets)
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;
    const { searchParams } = new URL(request.url);
    const projectIdFilter = searchParams.get('projectId');

    // Récupère les événements liés soit directement au userId, soit aux projets de cet utilisateur
    const allEvents = db
      .select({
        id: events.id,
        projectId: events.projectId,
        title: events.title,
        description: events.description,
        date: events.date,
        isCompleted: events.isCompleted,
        projectTitle: projects.title,
        projectColor: projects.color,
        projectOwnerId: projects.ownerId,
      })
      .from(events)
      .leftJoin(projects, eq(events.projectId, projects.id))
      .where(
        or(
          eq(events.userId, userId),
          eq(projects.ownerId, userId)
        )
      )
      .all();

    // Filtrer si un projet spécifique est sélectionné
    const filteredEvents = projectIdFilter && projectIdFilter !== 'all'
      ? allEvents.filter(e => e.projectId === projectIdFilter)
      : allEvents;

    return NextResponse.json(filteredEvents);
  } catch (error) {
    console.error('Erreur GET /api/events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer un événement
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;
    const { projectId, title, description, date } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });
    }

    const newEventId = crypto.randomUUID();

    db.insert(events).values({
      id: newEventId,
      userId,
      projectId: projectId || null,
      title,
      description: description || null,
      date,
      isCompleted: false,
    }).run();

    return NextResponse.json({ success: true, id: newEventId });
  } catch (error) {
    console.error('Erreur POST /api/events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
