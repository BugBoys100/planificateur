import { SignJWT, jwtVerify } from 'jose';

// En production, cette clé devra être dans un fichier .env
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-cle-secrete-pour-le-dev-a-changer'
);

export async function signToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Le cookie restera valide 7 jours
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
