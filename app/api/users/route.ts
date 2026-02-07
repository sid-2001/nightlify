import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const mobile = searchParams.get('mobile');

  if (!mobile) {
    return NextResponse.json({ error: 'mobile is required' }, { status: 400 });
  }

  const user = await db.collection('users').findOne({ mobile });
  return NextResponse.json(user ?? {});
}

export async function POST(request: Request) {
  const user = await request.json();
  const db = await getDb();

  const userWithMeta = {
    ...user,
    createdAt: new Date().toISOString()
  };

  await db.collection('users').updateOne(
    { mobile: user.mobile },
    { $set: userWithMeta },
    { upsert: true }
  );
  return NextResponse.json(userWithMeta, { status: 201 });
}
