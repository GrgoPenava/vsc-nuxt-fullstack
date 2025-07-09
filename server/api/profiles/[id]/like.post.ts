import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri je li korisnik prijavljen
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      });
    }

    const userId = event.user.id;
    const profileId = getRouterParam(event, "id");

    if (!profileId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Profile ID is required",
      });
    }

    // Provjeri postoji li profil
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Profile not found",
      });
    }

    // Provjeri ima li korisnik već lajk ili dislajk
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        profileId,
      },
    });

    const existingDislike = await prisma.dislike.findFirst({
      where: {
        userId,
        profileId,
      },
    });

    // Ako korisnik već ima lajk, ukloni ga
    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      await prisma.profile.update({
        where: { id: profileId },
        data: { likeCount: { decrement: 1 } },
      });

      return {
        message: "Like removed successfully",
        liked: false,
        disliked: false,
      };
    }

    // Ako korisnik ima dislajk, ukloni ga i dodaj lajk
    if (existingDislike) {
      await prisma.dislike.delete({
        where: { id: existingDislike.id },
      });

      await prisma.profile.update({
        where: { id: profileId },
        data: { dislikeCount: { decrement: 1 } },
      });
    }

    // Dodaj novi lajk
    await prisma.like.create({
      data: {
        userId,
        profileId,
      },
    });

    await prisma.profile.update({
      where: { id: profileId },
      data: { likeCount: { increment: 1 } },
    });

    return {
      message: "Profile liked successfully",
      liked: true,
      disliked: false,
    };
  } catch (error: any) {
    console.error("Error liking profile:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
