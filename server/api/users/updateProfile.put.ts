import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { z } from "zod";

// Shema za validaciju podataka za ažuriranje profila
const updateProfileSchema = z.object({
  email: z.string().email("Unesite ispravnu email adresu").optional(),
  firstName: z.string().min(1, "Ime je obavezno").optional(),
  lastName: z.string().min(1, "Prezime je obavezno").optional(),
  bio: z
    .string()
    .max(500, "Biografija može imati najviše 500 znakova")
    .optional(),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri autentikaciju
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je prijava",
      });
    }

    const body = await readBody(event);

    // Validiraj podatke
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validationResult.error.errors[0].message,
      });
    }

    const validatedData = validationResult.data;

    // Dohvati korisnika iz baze
    const existingUser = await prisma.user.findUnique({
      where: { id: event.user.id },
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Pripremamo podatke za ažuriranje
    const userData: any = {};

    if (validatedData.email !== undefined) userData.email = validatedData.email;
    if (validatedData.firstName !== undefined)
      userData.firstName = validatedData.firstName;
    if (validatedData.lastName !== undefined)
      userData.lastName = validatedData.lastName;
    if (validatedData.bio !== undefined) userData.bio = validatedData.bio;

    // Ažuriraj korisnika u bazi
    const updatedUser = await prisma.user.update({
      where: { id: event.user.id },
      data: userData,
      include: { role: true },
    });

    // Pripremi odgovor bez osjetljivih podataka
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatar: updatedUser.avatar,
      role: updatedUser.role.name,
      verified: updatedUser.verified,
      bio: updatedUser.bio,
    };

    return {
      message: "Profil uspješno ažuriran",
      user: userResponse,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom ažuriranja profila",
    });
  }
});
