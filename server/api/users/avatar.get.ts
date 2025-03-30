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

    console.log("user", user);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Ako korisnik nema avatar, vrati default
    if (!user.avatar) {
      return {
        avatarUrl: null,
      };
    }

    // Generiraj signed URL za S3 objekt
    const signedUrl = await getFileUrl("/avatars/" + user.avatar);

    return {
      avatarUrl: signedUrl,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom dohvata avatara",
    });
  }
});
