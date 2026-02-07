import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: Request) {
  const db = await getDb();
  const { searchParams } = new URL(request.url);
  const mobile = searchParams.get('mobile');
  const all = searchParams.get('all');

  if (all !== 'true' && !mobile) {
    return NextResponse.json({ error: 'mobile is required' }, { status: 400 });
  }

  const filter = all === 'true' ? {} : { mobile };
  const orders = await db.collection('orders').find(filter).toArray();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const order = await request.json();
  const db = await getDb();

  const orderWithMeta = {
    ...order,
    createdAt: new Date().toISOString()
  };

  await db.collection('orders').insertOne(orderWithMeta);
  return NextResponse.json(orderWithMeta, { status: 201 });
}

export async function PATCH(request: Request) {
  const { id, status, manager, paymentStatus } = await request.json();
  const db = await getDb();

  await db.collection('orders').updateOne(
    { id },
    { $set: { status, manager, paymentStatus } }
  );
  const updated = await db.collection('orders').findOne({ id });
  return NextResponse.json(updated ?? {});
}
