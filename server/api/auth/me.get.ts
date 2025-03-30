import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri je li korisnik prijavljen
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentifikacija",
      });
    }

    // Dohvati podatke o korisniku
    const user = await prisma.user.findUnique({
      where: { id: event.user.id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

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
      bio: user.bio,
    };

    return userResponse;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage ||
        "Došlo je do greške prilikom dohvaćanja korisničkih podataka",
    });
  }
});
