import { NextResponse } from 'next/server';
import { db } from '@/db';
import { events, projects, users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(
  request: Request,
  props: { params: Promise<{ token: string }> }
) {
  try {
    const params = await props.params;
    const icalToken = params.token;

    // Trouver l'utilisateur correspondant au jeton iCal
    const user = db.select().from(users).where(eq(users.id, icalToken)).get();
    if (!user) {
      return new NextResponse('Flux non trouvé', { status: 404 });
    }

    // Récupérer tous les événements de l'utilisateur
    const userEvents = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        isCompleted: events.isCompleted,
        projectTitle: projects.title,
      })
      .from(events)
      .leftJoin(projects, eq(events.projectId, projects.id))
      .where(
        or(
          eq(events.userId, user.id),
          eq(projects.ownerId, user.id)
        )
      )
      .all();

    // Formatage au format iCalendar (.ics)
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Skeul Calendar//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Skeul - ${user.name}`,
    ];

    userEvents.forEach((ev) => {
      const cleanDate = ev.date.replace(/-/g, '');
      const title = ev.projectTitle ? `[${ev.projectTitle}] ${ev.title}` : ev.title;
      const status = ev.isCompleted ? 'COMPLETED' : 'NEEDS-ACTION';

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${ev.id}@skeul.app`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${cleanDate}`);
      icsContent.push(`SUMMARY:${title}`);
      if (ev.description) {
        icsContent.push(`DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`);
      }
      icsContent.push(`STATUS:${status}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    return new NextResponse(icsContent.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="skeul_calendar.ics"`,
      },
    });
  } catch (error) {
    console.error('Erreur génération iCal:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
