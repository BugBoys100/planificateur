import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { projects, events, effortLevels, users } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// GET : Récupérer les projets de l'utilisateur connecté
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;

    // Récupérer les projets avec leur niveau d'effort
    const userProjects = db.select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      color: projects.color,
      deadline: projects.deadline,
      levelName: effortLevels.name,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .leftJoin(effortLevels, eq(projects.levelId, effortLevels.id))
    .where(eq(projects.ownerId, userId))
    .all();

    // Ajouter le nombre de tâches pour chaque projet
    const result = userProjects.map((proj) => {
      const projectEvents = db.select().from(events).where(eq(events.projectId, proj.id)).all();
      const completedEvents = projectEvents.filter(e => e.isCompleted).length;

      return {
        ...proj,
        totalEvents: projectEvents.length,
        completedEvents,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur GET /api/projects:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer un projet (Code existant inchangé)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide ou expirée.' }, { status: 401 });

    const userId = payload.id as string;
    const existingUser = db.select().from(users).where(eq(users.id, userId)).get();
    if (!existingUser) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });

    const body = await request.json();
    const { title, description, color, deadline, levelId } = body;

    if (!title || !deadline || !levelId) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const level = db.select().from(effortLevels).where(eq(effortLevels.id, levelId)).get();
    if (!level) return NextResponse.json({ error: 'Niveau d\'effort invalide.' }, { status: 400 });

    const percentage = level.percentage;
    const projectId = crypto.randomUUID();

    db.insert(projects).values({
      id: projectId,
      title,
      description: description || null,
      color: color || '#3b82f6',
      deadline,
      levelId,
      ownerId: userId,
    }).run();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(deadline);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const numSessions = Math.max(1, Math.ceil((totalDays * percentage) / 100));
    const step = totalDays / numSessions;

    for (let i = 0; i < numSessions; i++) {
      const eventDate = new Date(today);
      const daysToAdd = Math.floor(i * step + step / 2);
      eventDate.setDate(today.getDate() + daysToAdd);

      if (eventDate > endDate) eventDate.setTime(endDate.getTime());

      const formattedDate = eventDate.toISOString().split('T')[0];

      db.insert(events).values({
        id: crypto.randomUUID(),
        projectId: projectId,
        title: `Session ${i + 1}/${numSessions} — ${title}`,
        date: formattedDate,
        isCompleted: false,
      }).run();
    }

    return NextResponse.json({ success: true, projectId });
  } catch (error: any) {
    console.error('Erreur API Projects POST:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la création du projet.' }, { status: 500 });
  }
}
