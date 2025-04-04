import { H3Event, createError } from "h3";
import formidable from "formidable";
import prisma from "~/lib/prisma";
import { nanoid } from "nanoid";
import { uploadFile as uploadToS3 } from "~/server/utils/s3";
import fs from "fs";
import path from "path";
import { Prisma } from "@prisma/client";

// Pomoćna funkcija za parsiranje multipart/form-data
async function parseMultipartForm(event: H3Event) {
  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      const form = formidable({ multiples: true });

      form.parse(
        event.node.req,
        (
          err: Error | null,
          fields: formidable.Fields,
          files: formidable.Files
        ) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({ fields, files });
        }
      );
    }
  );
}

// Funkcija za pretvaranje datoteke u Buffer
async function fileToBuffer(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri je li korisnik prijavljen
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentifikacija",
      });
    }

    // Dodatna provjera iz baze podataka ako je potrebno
    const userId = event.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentifikacija - korisnik nije pronađen",
      });
    }

    // Parsiranje multipart/form-data
    const { fields, files } = await parseMultipartForm(event);

    // Validacija osnovnih podataka
    if (!fields.name || !fields.description) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields",
      });
    }

    // Priprema podataka za kreiranje
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const description = Array.isArray(fields.description)
      ? fields.description[0]
      : fields.description;
    const jsonContent = Array.isArray(fields.jsonContent)
      ? fields.jsonContent[0]
      : fields.jsonContent || null;

    // Parsiranje ekstenzija iz JSON stringa
    let extensions = [];
    if (fields.extensions) {
      const extensionsString = Array.isArray(fields.extensions)
        ? fields.extensions[0]
        : fields.extensions;
      try {
        extensions = JSON.parse(extensionsString);
      } catch (error) {
        console.error("Error parsing extensions:", error);
      }
    }

    // Upload datoteka
    let profileFilePath = null;
    let profileFileName = null;
    let profileFileSize = null;

    // Upload profil datoteke
    if (files.profileFile) {
      const profileFile = Array.isArray(files.profileFile)
        ? files.profileFile[0]
        : files.profileFile;
      const originalFileName =
        profileFile.originalFilename || `profile-${nanoid()}`;
      const fileExtension = path.extname(originalFileName);
      const fileName = `${nanoid()}${fileExtension}`;

      // Upload na S3
      try {
        // Pretvori datoteku u Buffer
        const fileBuffer = await fileToBuffer(profileFile.filepath);
        // Odredi MIME tip datoteke
        const contentType = profileFile.mimetype || "application/octet-stream";

        // Upload na S3
        profileFilePath = await uploadToS3(
          fileName,
          fileBuffer,
          contentType,
          "profiles"
        );

        profileFileName = originalFileName;
        profileFileSize = profileFile.size;
      } catch (error) {
        console.error("Error uploading profile file:", error);
        throw createError({
          statusCode: 500,
          statusMessage: "Error uploading profile file",
        });
      }
    }

    // Upload slika
    const imageUrls: string[] = [];
    const imageKeys = Object.keys(files).filter((key) =>
      key.startsWith("image")
    );

    for (const key of imageKeys) {
      const imageFile = Array.isArray(files[key]) ? files[key][0] : files[key];
      if (imageFile) {
        const originalFileName =
          imageFile.originalFilename || `image-${nanoid()}`;
        const fileExtension = path.extname(originalFileName);
        const fileName = `${nanoid()}${fileExtension}`;

        try {
          // Pretvori datoteku u Buffer
          const fileBuffer = await fileToBuffer(imageFile.filepath);
          // Odredi MIME tip datoteke
          const contentType = imageFile.mimetype || "image/jpeg";

          // Upload na S3
          const s3Key = await uploadToS3(
            fileName,
            fileBuffer,
            contentType,
            "profiles/images"
          );

          imageUrls.push(s3Key);
        } catch (error) {
          console.error(`Error uploading image ${key}:`, error);
        }
      }
    }

    // Postavi prvu sliku kao preview sliku ako postoji
    const previewImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

    // Kreiraj profil u bazi
    const profileData: any = {
      name,
      description,
      filePath: profileFilePath,
      fileName: profileFileName,
      fileSize: profileFileSize ? parseInt(profileFileSize.toString()) : null,
      previewImageUrl,
      userId: event.user.id,
    };

    // Dodaj dodatna polja ako su dostupna
    if (jsonContent) {
      profileData.jsonContent = jsonContent;
    }

    if (imageUrls.length > 0) {
      profileData.images = imageUrls;
    }

    const profile = await prisma.profile.create({
      data: profileData,
    });

    // Kreiraj ekstenzije za profil
    if (extensions.length > 0) {
      for (const ext of extensions) {
        const extensionId = ext.extensionId || `${ext.publisher}.${ext.name}`;

        // Provjeri postoji li već ekstenzija
        // @ts-ignore - Ignoriramo TypeScript grešku za lowercase model
        let extension = await prisma.extension.findUnique({
          where: { extensionId: extensionId },
        });

        // Ako postoji a ima link, ažuriraj link
        if (extension) {
          if (ext.link) {
            // @ts-ignore - Ignoriramo TypeScript grešku za lowercase model
            extension = await prisma.extension.update({
              where: { id: extension.id },
              data: {
                link: ext.link,
                updatedAt: new Date(),
              },
            });
          }
        } else {
          // Kreiraj novu ekstenziju
          // @ts-ignore - Ignoriramo TypeScript grešku za lowercase model
          extension = await prisma.extension.create({
            data: {
              id: nanoid(),
              extensionId: extensionId,
              name: ext.name,
              publisher: ext.publisher,
              description: ext.description || null,
              link: ext.link || null,
            },
          });
        }

        // Poveži ekstenziju s profilom
        if (extension) {
          // @ts-ignore - Ignoriramo TypeScript grešku za lowercase model
          await prisma.profileExtension.create({
            data: {
              id: nanoid(),
              profileId: profile.id,
              extensionId: extension.id,
            },
          });
        }
      }
    }

    return {
      id: profile.id,
      message: "Profile created successfully",
    };
  } catch (error: any) {
    console.error("Error creating profile:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error",
    });
  }
});
