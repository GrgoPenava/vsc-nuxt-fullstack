import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { deleteFile } from "~/server/utils/s3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri autentikaciju - koristi event.user koje postavlja auth middleware
    if (!event.user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentikacija",
      });
    }

    // Provjeri administratorska prava
    if (event.user.role !== "admin") {
      throw createError({
        statusCode: 403,
        statusMessage: "Nemate pravo pristupa ovom resursu",
      });
    }

    // Dohvati userId iz query parametara
    const query = getQuery(event);
    const userId = query.userId as string;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID korisnika je obavezan",
      });
    }

    // Dohvati korisnika i putanju do avatara
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Ako korisnik ima avatar, obriši ga iz S3 bucketa
    if (user.avatar) {
      try {
        await deleteFile(user.avatar);
        console.log(`Avatar ${user.avatar} uspješno obrisan iz S3 bucketa`);
      } catch (error) {
        console.error("Greška pri brisanju datoteke iz S3:", error);
        // Nastaviti ćemo iako je brisanje iz S3 neuspješno
      }
    }

    // Ažuriraj korisnika u bazi podataka
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
    });

    return {
      success: true,
      message: "Avatar korisnika je uspješno obrisan",
    };
  } catch (error: any) {
    console.error("Greška prilikom brisanja avatara:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom brisanja avatara",
    });
  }
});
