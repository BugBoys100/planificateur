import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { projects, events, effortLevels } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET : Récupérer un projet spécifique avec ses événements
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;

    const project = db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        color: projects.color,
        deadline: projects.deadline,
        levelId: projects.levelId,
        levelName: effortLevels.name,
      })
      .from(projects)
      .leftJoin(effortLevels, eq(projects.levelId, effortLevels.id))
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
      .get();

    if (!project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    }

    const projectEvents = db
      .select()
      .from(events)
      .where(eq(events.projectId, projectId))
      .all();

    return NextResponse.json({ ...project, events: projectEvents });
  } catch (error) {
    console.error('Erreur GET /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier un projet
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;
    const body = await request.json();
    const { title, description, color, deadline } = body;

    db.update(projects)
      .set({
        title,
        description: description || null,
        color,
        deadline,
      })
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PUT /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer un projet et ses événements
export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const projectId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;

    db.delete(events).where(eq(events.projectId, projectId)).run();
    db.delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, userId)))
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/projects/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
