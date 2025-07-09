import { H3Event, createError } from "h3";
import { comparePasswords, generateToken } from "~/server/utils/auth";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Dohvati podatke iz zahtjeva
    const { email, password } = await readBody(event);

    // Validiraj podatke
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email i lozinka su obavezni",
      });
    }

    // Pronađi korisnika prema emailu
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        password: true,
        avatar: true,
        verified: true,
        bio: true,
        disabled: true,
        roleId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Provjeri postoji li korisnik
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Netočan email ili lozinka",
      });
    }

    // Provjeri je li korisnik onemogućen
    if (user.disabled) {
      throw createError({
        statusCode: 403,
        statusMessage: "Vaš račun je onemogućen",
      });
    }

    // Provjeri lozinku
    const passwordsMatch = await comparePasswords(password, user.password);
    if (!passwordsMatch) {
      throw createError({
        statusCode: 401,
        statusMessage: "Netočan email ili lozinka",
      });
    }

    // Kreiraj token za prijavljenog korisnika
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Izostavi lozinku iz odgovora
    const { password: _, ...userWithoutPassword } = user;

    // Pripremi podatke za odgovor
    const userResponse = {
      id: userWithoutPassword.id,
      username: userWithoutPassword.username,
      email: userWithoutPassword.email,
      firstName: userWithoutPassword.firstName,
      lastName: userWithoutPassword.lastName,
      avatar: userWithoutPassword.avatar,
      role: userWithoutPassword.role.name,
      verified: userWithoutPassword.verified,
      bio: userWithoutPassword.bio,
    };

    // Vrati podatke za uspješnu prijavu
    return {
      token,
      user: userResponse,
    };
  } catch (error: any) {
    console.error("Greška pri prijavi:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom prijave",
    });
  }
});
