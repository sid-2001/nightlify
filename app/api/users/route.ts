import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

const memoryUsers: Array<Record<string, unknown>> = [];

export async function GET() {
  const db = await getDb();
  if (db) {
    const users = await db.collection('users').find({}).toArray();
    return NextResponse.json(users);
  }

  return NextResponse.json(memoryUsers);
}

export async function POST(request: Request) {
  const user = await request.json();
  const db = await getDb();

  const userWithMeta = {
    ...user,
    createdAt: new Date().toISOString()
  };

  if (db) {
    await db.collection('users').insertOne(userWithMeta);
    return NextResponse.json(userWithMeta, { status: 201 });
  }

  memoryUsers.push(userWithMeta);
  return NextResponse.json(userWithMeta, { status: 201 });
}
