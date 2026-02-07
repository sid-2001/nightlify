import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const memoryClubs: Array<Record<string, unknown>> = [
  {
    id: 'club-1',
    name: 'Nova Lounge',
    location: 'Bandra, Mumbai',
    vibe: 'EDM Nights'
  },
  {
    id: 'club-2',
    name: 'Skyline Social',
    location: 'Gurugram',
    vibe: 'Rooftop Beats'
  },
  {
    id: 'club-3',
    name: 'Velvet Room',
    location: 'Indiranagar, Bengaluru',
    vibe: 'Ladies Night'
  }
];

export async function GET() {
  const db = await getDb();
  if (db) {
    const clubs = await db.collection('clubs').find({}).toArray();
    return NextResponse.json(clubs.length ? clubs : memoryClubs);
  }

  return NextResponse.json(memoryClubs);
}

export async function POST(request: Request) {
  const club = await request.json();
  const db = await getDb();

  const clubWithMeta = {
    ...club,
    createdAt: new Date().toISOString()
  };

  if (db) {
    await db.collection('clubs').insertOne(clubWithMeta);
    return NextResponse.json(clubWithMeta, { status: 201 });
  }

  memoryClubs.push(clubWithMeta);
  return NextResponse.json(clubWithMeta, { status: 201 });
}
