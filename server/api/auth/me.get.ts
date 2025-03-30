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

    // Dohvati korisnika iz baze
    const user = await prisma.user.findUnique({
      where: { id: event.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        verified: true,
        bio: true,
        disabled: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Pripremi odgovor
    const response = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      verified: user.verified,
      bio: user.bio,
      disabled: user.disabled,
      role: user.role.name,
    };

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage ||
        "Došlo je do greške prilikom dohvaćanja korisničkih podataka",
    });
  }
});
