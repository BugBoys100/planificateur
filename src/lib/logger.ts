import { db } from '@/db';
import { logs } from '@/db/schema';
import crypto from 'crypto';

export type LogCategory = 'EVENT' | 'PROJECT' | 'AUTH' | 'ADMIN';

export async function logAction({
  userId,
  userName,
  userEmail,
  action,
  category,
  details,
  request,
}: {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: string;
  category: LogCategory;
  details: string;
  request?: Request;
}) {
  try {
    let metadata: Record<string, any> = {};

    if (request) {
      const userAgent = request.headers.get('user-agent') || 'Inconnu';
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

      metadata = {
        ip,
        userAgent,
      };
    }

    db.insert(logs)
      .values({
        id: crypto.randomUUID(),
        userId: userId || null,
        userName: userName || 'Système',
        userEmail: userEmail || null,
        action,
        category,
        details,
        metadata: JSON.stringify(metadata),
      })
      .run();
  } catch (err) {
    console.error('Erreur enregistrement log:', err);
  }
}
