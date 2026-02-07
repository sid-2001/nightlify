import { SignJWT, jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET in environment');
}

const secret = new TextEncoder().encode(jwtSecret);

export type AuthPayload = {
  mobile: string;
};

export async function signToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as AuthPayload;
}
