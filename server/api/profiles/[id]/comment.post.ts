import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { nanoid } from "nanoid";
import { getFileUrl } from "~/server/utils/s3";

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

    // Dohvati tijelo zahtjeva
    const body = await readBody(event);

    if (!body.content || body.content.trim() === "") {
      throw createError({
        statusCode: 400,
        statusMessage: "Comment content is required",
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

    // Kreiraj komentar
    const comment = await prisma.comment.create({
      data: {
        content: body.content.trim(),
        userId,
        profileId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Dohvati signed URL za avatar korisnika
    if (comment.user && comment.user.avatar) {
      const avatarUrl = await getFileUrl(comment.user.avatar);
      comment.user.avatar = avatarUrl;
    }

    return {
      message: "Comment added successfully",
      comment,
    };
  } catch (error: any) {
    console.error("Error adding comment:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  }
});
