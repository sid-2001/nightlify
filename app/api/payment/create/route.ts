import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const token = '504be3cb1270cd7c0229fd53671ff87a69003'

  if (!token) {
    return NextResponse.json(
      { error: 'PAYMENT_AUTH_TOKEN is not configured' },
      { status: 500 }
    );
  }

  const response = await fetch(
    'https://apihome.in/panel/api/payin_intent/create_payment.php',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // 'api_key':token,
        // 'Cookie': 'PHPSESSID=f36bf9a0617be55b4d0e658f1c25ca47'
      },
      body: JSON.stringify(body)
    }
  );



  const data = await response.json();
  console.log("bhai data aa gya",data)
  return NextResponse.json(data);
}
