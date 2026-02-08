import { NextResponse } from 'next/server';
import { signToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  const { mobile } = await request.json();

  if (!mobile) {
    return NextResponse.json(
      { error: 'mobile is required' },
      { status: 400 }
    );
  }

  const token = await signToken({ mobile });

  // ✅ send token to frontend
  return NextResponse.json({
    status: 'success',
    token
  });
}
