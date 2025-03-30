import { H3Event, createError } from "h3";
import { loginSchema, LoginInput } from "~/server/utils/validation";
import { comparePasswords, generateToken } from "~/server/utils/auth";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Dohvati podatke iz requesta
    const body = await readBody(event);

    // Validiraj podatke
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error.errors[0].message,
      });
    }

    const { email, password } = result.data as LoginInput;

    // Provjeri postoji li korisnik s unesenim emailom
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Pogrešan email ili lozinka",
      });
    }

    // Provjeri lozinku
    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Pogrešan email ili lozinka",
      });
    }

    // Generiraj token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role.name,
    });

    // Pripremi odgovor bez osjetljivih podataka
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role.name,
      verified: user.verified,
    };

    return {
      message: "Prijava uspješna",
      user: userResponse,
      token,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom prijave",
    });
  }
});
