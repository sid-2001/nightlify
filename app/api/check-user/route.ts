import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    console.log("jai shree ram")
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile number required' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const user = await db?.collection('users').findOne({
      mobile
    });
    console.log("i m here")

    return NextResponse.json({
      exists: !!user
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
