import { H3Event, createError } from "h3";
import { uploadFile } from "~/server/utils/s3";
import prisma from "~/lib/prisma";
import { defineEventHandler, readMultipartFormData } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  try {
    console.log("Započinjem upload avatara...");

    // Provjeri autentikaciju
    if (!event.user || !event.user.id) {
      console.log("Greška: Korisnik nije prijavljen");
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je prijava",
      });
    }

    // Parsiranje podataka iz multipart form-data
    console.log("Čitam multipart form podatke...");
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      console.log("Greška: Nema podataka u form-data");
      throw createError({
        statusCode: 400,
        statusMessage: "Nije pronađena slika",
      });
    }

    console.log(`Primljeno ${formData.length} dijelova form-data`);

    // Ispis svih dijelova form-data za debagiranje
    formData.forEach((part, index) => {
      console.log(
        `Form dio #${index}: name=${part.name}, filename=${
          part.filename || "N/A"
        }, type=${part.type || "N/A"}, size=${part.data?.length || 0} bytes`
      );
    });

    // Pronađi file
    const file = formData.find((part) => part.name === "avatar");
    if (!file || !file.data || !file.filename) {
      console.log("Greška: Nije pronađen dio 'avatar' u form-data");
      throw createError({
        statusCode: 400,
        statusMessage: "Nije pronađena slika",
      });
    }

    // Provjeri tip slike
    const contentType = file.type || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      console.log(`Greška: Neispravan tip datoteke: ${contentType}`);
      throw createError({
        statusCode: 400,
        statusMessage: "Dozvoljene su samo slike (JPEG, PNG, GIF)",
      });
    }

    console.log(
      `Pronađena slika: ${file.filename}, veličina: ${file.data.length} bajtova, tip: ${contentType}`
    );

    // Upload slike u S3
    console.log("Započinjem upload u S3...");
    const s3Key = await uploadFile(file.filename, file.data, contentType);
    console.log(`Slika uspješno uploadana u S3 s ključem: ${s3Key}`);

    // Dohvati trenutnog korisnika
    console.log(`Dohvaćam podatke o korisniku s ID: ${event.user.id}`);
    const user = await prisma.user.findUnique({
      where: { id: event.user.id },
    });

    if (!user) {
      console.log(
        `Greška: Korisnik s ID ${event.user.id} nije pronađen u bazi`
      );
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Spremi putanju do slike u bazu
    console.log(
      `Ažuriram avatar u bazi podataka za korisnika: ${user.username}`
    );
    const updatedUser = await prisma.user.update({
      where: { id: event.user.id },
      data: { avatar: s3Key },
    });
    console.log("Avatar uspješno ažuriran u bazi podataka");

    return {
      message: "Avatar uspješno prenesen",
      avatarPath: s3Key,
    };
  } catch (error: any) {
    console.error("Greška prilikom uploada avatara:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom prijenosa avatara",
    });
  }
});
