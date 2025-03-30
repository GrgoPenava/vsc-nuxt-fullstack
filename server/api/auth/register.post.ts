import { H3Event, createError } from "h3";
import { registerSchema, RegisterInput } from "~/server/utils/validation";
import { hashPassword } from "~/server/utils/auth";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Dohvati podatke iz requesta
    const body = await readBody(event);

    // Validiraj podatke
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error.errors[0].message,
      });
    }

    const { username, email, firstName, lastName, password } =
      result.data as RegisterInput;

    // Provjeri postoji li korisnik s istim emailom ili korisničkim imenom
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Korisnik s tim email-om ili korisničkim imenom već postoji",
      });
    }

    // Dohvati zadanu ulogu (user)
    let userRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    // Ako uloga ne postoji, kreiraj je
    if (!userRole) {
      userRole = await prisma.role.create({
        data: { name: "user" },
      });
    }

    // Hashiraj lozinku
    const hashedPassword = await hashPassword(password);

    // Kreiraj novog korisnika
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        roleId: userRole.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        verified: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      message: "Registracija uspješna",
      user: newUser,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom registracije",
    });
  }
});
