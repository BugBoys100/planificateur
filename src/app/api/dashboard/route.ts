import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { events, projects } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq, or } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Session invalide' }, { status: 401 });

    const userId = payload.id as string;

    // Dates du jour et de demain au format YYYY-MM-DD
    const todayObj = new Date();
    const tomorrowObj = new Date(todayObj);
    tomorrowObj.setDate(todayObj.getDate() + 1);

    const todayStr = todayObj.toISOString().split('T')[0];
    const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

    // 1. Récupérer les événements (libres + projets)
    const userEvents = db
      .select({
        id: events.id,
        projectId: events.projectId,
        title: events.title,
        description: events.description,
        date: events.date,
        isCompleted: events.isCompleted,
        projectTitle: projects.title,
        projectColor: projects.color,
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

    const todayEvents = userEvents.filter((e) => e.date === todayStr);
    const tomorrowEvents = userEvents.filter((e) => e.date === tomorrowStr);

    // 2. Récupérer les projets pour les deadlines
    const userProjects = db
      .select({
        id: projects.id,
        title: projects.title,
        color: projects.color,
        deadline: projects.deadline,
      })
      .from(projects)
      .where(eq(projects.ownerId, userId))
      .all();

    const projectsWithProgress = userProjects.map((proj) => {
      const projEvents = userEvents.filter((e) => e.projectId === proj.id);
      const total = projEvents.length;
      const completed = projEvents.filter((e) => e.isCompleted).length;

      // Calcul jours restants avant deadline
      const deadlineDate = new Date(proj.deadline);
      const diffTime = deadlineDate.getTime() - todayObj.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...proj,
        totalEvents: total,
        completedEvents: completed,
        daysLeft,
      };
    });

    // Tri par proximité de deadline
    projectsWithProgress.sort((a, b) => a.daysLeft - b.daysLeft);

    return NextResponse.json({
      userName: payload.name || 'Luc',
      todayEvents,
      tomorrowEvents,
      upcomingDeadlines: projectsWithProgress,
    });
  } catch (error) {
    console.error('Erreur GET /api/dashboard:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
