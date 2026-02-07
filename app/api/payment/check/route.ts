import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const token = process.env.PAYMENT_AUTH_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: 'PAYMENT_AUTH_TOKEN is not configured' },
      { status: 500 }
    );
  }

  const response = await fetch(
    'https://apihome.in/panel/api/payin_intent/check_utr.php',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
