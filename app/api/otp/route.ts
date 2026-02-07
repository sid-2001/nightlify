import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { mobile, otp } = await request.json();

  const apiKey = process.env.OTP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OTP_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const url = `https://apihome.in/panel/api/bulksms/?key=${apiKey}&mobile=${mobile}&otp=${otp}`;

  const response = await fetch(url, { method: 'GET' });
  const data = await response.text();

  return NextResponse.json({ response: data });
}
