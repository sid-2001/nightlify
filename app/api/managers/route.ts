import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const memoryManagers: Array<Record<string, unknown>> = [];

export async function GET() {
  const db = await getDb();
  if (db) {
    const managers = await db.collection('managers').find({}).toArray();
    return NextResponse.json(managers);
  }

  return NextResponse.json(memoryManagers);
}

export async function POST(request: Request) {
  const manager = await request.json();
  const db = await getDb();

  const managerWithMeta = {
    ...manager,
    createdAt: new Date().toISOString()
  };

  if (db) {
    await db.collection('managers').insertOne(managerWithMeta);
    return NextResponse.json(managerWithMeta, { status: 201 });
  }

  memoryManagers.push(managerWithMeta);
  return NextResponse.json(managerWithMeta, { status: 201 });
}
