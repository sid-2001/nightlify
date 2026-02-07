import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET() {
  const db = await getDb();
  const managers = await db.collection('managers').find({}).toArray();
  return NextResponse.json(managers);
}

export async function POST(request: Request) {
  const manager = await request.json();
  const db = await getDb();

  const managerWithMeta = {
    ...manager,
    createdAt: new Date().toISOString()
  };

  await db.collection('managers').insertOne(managerWithMeta);
  return NextResponse.json(managerWithMeta, { status: 201 });
}
