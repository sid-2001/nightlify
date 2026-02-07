import { NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  const { mobile } = await request.json();

  if (!mobile) {
    return NextResponse.json({ error: 'mobile is required' }, { status: 400 });
  }

  const token = await signToken({ mobile });
  const response = NextResponse.json({ status: 'success' });
  response.cookies.set('nightfly_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });

  return response;
}
