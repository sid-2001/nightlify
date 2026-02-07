import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const db = await getDb();
  const clubs = await db.collection('clubs').find({}).toArray();
  return NextResponse.json(clubs);
}

export async function POST(request: Request) {
  const club = await request.json();
  const db = await getDb();

  const clubWithMeta = {
    ...club,
    createdAt: new Date().toISOString()
  };

  await db.collection('clubs').insertOne(clubWithMeta);
  return NextResponse.json(clubWithMeta, { status: 201 });
}
