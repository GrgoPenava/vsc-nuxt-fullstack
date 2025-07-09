import { H3Event, createError } from "h3";
import { readFiles } from "h3-formidable";
import prisma from "~/lib/prisma";
import { uploadFile } from "~/server/utils/s3";

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

    // Čitaj multipart form podatke
    const { fields, files } = await readFiles(event, {
      includeFields: true,
    });

    console.log("Primljeni form podaci:", {
      fields,
      files: Object.keys(files),
    });

    // Provjeri je li poslan avatar
    const avatarFiles = files.avatar;
    if (!avatarFiles || avatarFiles.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Datoteka avatara nije poslana",
      });
    }

    // Provjeri je li poslan userId
    const userIdField = fields.userId;
    if (!userIdField || userIdField.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID korisnika nije poslan",
      });
    }

    const userId = userIdField[0];
    const avatarFile = avatarFiles[0];

    // Provjeri tip datoteke
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(avatarFile.mimetype)) {
      throw createError({
        statusCode: 400,
        statusMessage:
          "Nepodržani format datoteke. Dozvoljeni formati su: JPG, PNG",
      });
    }

    // Provjeri postoji li korisnik
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Učitaj datoteku u S3 bucket
    console.log("Učitavam datoteku u S3 bucket...");
    const avatarPath = await uploadFile(
      avatarFile.originalFilename || "avatar.jpg",
      await readFile(avatarFile.filepath),
      avatarFile.mimetype
    );
    console.log("Datoteka uspješno učitana, putanja:", avatarPath);

    // Ažuriraj avatara u bazi podataka
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
    });

    return {
      success: true,
      message: "Avatar korisnika je uspješno učitan",
    };
  } catch (error: any) {
    console.error("Greška prilikom učitavanja avatara:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom učitavanja avatara",
    });
  }
});

// Helper funkcija za čitanje datoteke kao Buffer
async function readFile(path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const fs = require("fs");
    fs.readFile(path, (err: any, data: Buffer) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
