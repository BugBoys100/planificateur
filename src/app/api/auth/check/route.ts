import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function GET() {
  try {
    const allUsers = db.select().from(users).all();
    return NextResponse.json({ needsInit: allUsers.length === 0 });
  } catch (error) {
    return NextResponse.json({ needsInit: false }, { status: 500 });
  }
}
