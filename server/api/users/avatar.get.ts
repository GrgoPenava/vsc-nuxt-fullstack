import { H3Event, createError } from "h3";
import { getFileUrl } from "~/server/utils/s3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Dohvati userId iz query parametara
    const query = getQuery(event);
    const userId = query.userId as string;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID korisnika je obavezan",
      });
    }

    // Dohvati korisnika iz baze
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

    // Ako korisnik nema avatar u bazi, vrati null
    console.log("user -", user);
    if (!user.avatar) {
      return {
        avatarUrl: null,
      };
    }

    // Generiraj signed URL za S3 objekt
    const signedUrl = await getFileUrl(user.avatar);

    // Ako je signedUrl null, znači da datoteka ne postoji u S3 bucketu
    if (signedUrl === null) {
      console.log(
        `Avatar ${user.avatar} postoji u bazi, ali ne i u S3 bucketu`
      );

      // Opcija: Ažuriraj korisnički profil da nema avatar u bazi
      // await prisma.user.update({
      //   where: { id: userId },
      //   data: { avatar: null },
      // });
      // console.log(`Avatar za korisnika ${userId} postavljen na null u bazi`);

      return {
        avatarUrl: null,
      };
    }

    return {
      avatarUrl: signedUrl,
    };
  } catch (error: any) {
    console.error("Greška prilikom dohvata avatara:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom dohvata avatara",
    });
  }
});
