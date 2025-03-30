import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri autentikaciju
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je prijava",
      });
    }

    // Provjeri admin role
    if (event.user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Nemate ovlasti za pristup ovom resursu",
      });
    }

    // Dohvati sve korisnike iz baze
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Vrati korisničke podatke bez osjetljivih informacija
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role.name,
      verified: user.verified,
      bio: user.bio,
      createdAt: user.createdAt,
    }));

    return safeUsers;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom dohvata korisnika",
    });
  }
});
