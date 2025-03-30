import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { H3Error } from "h3";

// Sučelje za korisničke podatke u tokenu
export interface UserTokenData {
  id: string;
  email: string;
  role: string;
}

// Funkcija za hashiranje lozinke
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Funkcija za usporedbu lozinke s hashiranom lozinkom
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Funkcija za kreiranje JWT tokena
export function generateToken(user: UserTokenData): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new H3Error("JWT_SECRET nije definiran u .env datoteci");
  }

  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: "24h",
  });
}

// Funkcija za verifikaciju tokena
export function verifyToken(token: string): UserTokenData {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new H3Error("JWT_SECRET nije definiran u .env datoteci");
  }

  try {
    return jwt.verify(token, secret) as UserTokenData;
  } catch (error) {
    throw new H3Error("Nevažeći ili istekli token");
  }
}
