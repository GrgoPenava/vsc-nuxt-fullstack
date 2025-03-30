import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { z } from "zod";

// Definiramo shemu za validaciju
const languageSchema = z.object({
  language: z.string().refine((val) => ["hr", "en"].includes(val), {
    message: "Jezik mora biti 'hr' ili 'en'",
  }),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri autentikaciju
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentikacija",
      });
    }

    // Dohvati podatke iz zahtjeva
    const body = await readBody(event);

    // Validiraj podatke
    const result = languageSchema.safeParse(body);

    if (!result.success) {
      throw createError({
        statusCode: 400,
        statusMessage: result.error.errors[0].message,
      });
    }

    // Dohvati korisnika
    const user = await prisma.user.findUnique({
      where: { id: event.user.id },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Ažuriraj jezik korisnika
    const updatedUser = await prisma.user.update({
      where: { id: event.user.id },
      data: {
        language: result.data.language,
      },
      include: {
        role: true,
      },
    });

    // Izostavi lozinku iz odgovora
    const { password: _, ...userWithoutPassword } = updatedUser;

    // Pripremi odgovor
    const userResponse = {
      id: userWithoutPassword.id,
      username: userWithoutPassword.username,
      email: userWithoutPassword.email,
      firstName: userWithoutPassword.firstName,
      lastName: userWithoutPassword.lastName,
      avatar: userWithoutPassword.avatar,
      role: updatedUser.role.name,
      verified: userWithoutPassword.verified,
      bio: userWithoutPassword.bio,
      language: userWithoutPassword.language,
      disabled: userWithoutPassword.disabled,
    };

    return {
      message: "Jezik uspješno ažuriran",
      user: userResponse,
    };
  } catch (error: any) {
    console.error("Greška pri ažuriranju jezika:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom ažuriranja jezika",
    });
  }
});
