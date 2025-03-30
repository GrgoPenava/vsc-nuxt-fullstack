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

    // Dohvati sve role iz baze
    const roles = await prisma.role.findMany();

    return roles;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom dohvata rola",
    });
  }
});
