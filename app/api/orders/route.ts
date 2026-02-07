import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const memoryOrders: Array<Record<string, unknown>> = [];

export async function GET() {
  const db = await getDb();
  if (db) {
    const orders = await db.collection('orders').find({}).toArray();
    return NextResponse.json(orders);
  }

  return NextResponse.json(memoryOrders);
}

export async function POST(request: Request) {
  const order = await request.json();
  const db = await getDb();

  const orderWithMeta = {
    ...order,
    createdAt: new Date().toISOString()
  };

  if (db) {
    await db.collection('orders').insertOne(orderWithMeta);
    return NextResponse.json(orderWithMeta, { status: 201 });
  }

  memoryOrders.push(orderWithMeta);
  return NextResponse.json(orderWithMeta, { status: 201 });
}

export async function PATCH(request: Request) {
  const { id, status, manager } = await request.json();
  const db = await getDb();

  if (db) {
    await db.collection('orders').updateOne(
      { id },
      { $set: { status, manager } }
    );
    const updated = await db.collection('orders').findOne({ id });
    return NextResponse.json(updated ?? {});
  }

  const index = memoryOrders.findIndex((order) => order.id === id);
  if (index !== -1) {
    memoryOrders[index] = {
      ...memoryOrders[index],
      status,
      manager
    };
  }
  return NextResponse.json(memoryOrders[index] ?? {});
}
