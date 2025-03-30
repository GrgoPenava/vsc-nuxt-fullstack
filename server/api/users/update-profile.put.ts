import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { z } from "zod";
import { hashPassword } from "~/server/utils/auth";

// Shema za validaciju podataka za ažuriranje profila
const updateProfileSchema = z
  .object({
    firstName: z.string().min(1, "Ime je obavezno").optional(),
    lastName: z.string().min(1, "Prezime je obavezno").optional(),
    bio: z
      .string()
      .max(500, "Biografija ne može biti duža od 500 znakova")
      .optional(),
    avatar: z.string().url("Avatar mora biti valjani URL").optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{6,})$/,
        "Lozinka mora imati najmanje 6 znakova, jedno veliko slovo i jedan poseban znak"
      )
      .optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // Ako postoji newPassword, mora postojati i currentPassword
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Morate unijeti trenutnu lozinku da biste promijenili lozinku",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      // Ako postoji newPassword, mora postojati i confirmNewPassword i moraju biti isti
      if (data.newPassword && data.confirmNewPassword !== data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Nove lozinke se ne podudaraju",
      path: ["confirmNewPassword"],
    }
  );

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri autentikaciju
    if (!event.user || !event.user.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je prijava za ažuriranje profila",
      });
    }

    const userId = event.user.id;
    const body = await readBody(event);

    // Validiraj podatke za ažuriranje
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validationResult.error.errors[0].message,
      });
    }

    const validatedData = validationResult.data;

    // Dohvati korisnika iz baze
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: "Korisnik nije pronađen",
      });
    }

    // Priprema podataka za ažuriranje
    const updateData: any = {};

    // Osnovni podaci
    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.bio !== undefined) updateData.bio = validatedData.bio;
    if (validatedData.avatar) updateData.avatar = validatedData.avatar;

    // Promjena lozinke
    if (validatedData.newPassword && validatedData.currentPassword) {
      // Provjeri trenutnu lozinku
      const { comparePasswords } = await import("~/server/utils/auth");
      const isPasswordValid = await comparePasswords(
        validatedData.currentPassword,
        existingUser.password
      );

      if (!isPasswordValid) {
        throw createError({
          statusCode: 400,
          statusMessage: "Trenutna lozinka nije ispravna",
        });
      }

      // Hashiraj novu lozinku
      updateData.password = await hashPassword(validatedData.newPassword);
    }

    // Ažuriraj korisnika u bazi
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { role: true },
    });

    // Pripremi odgovor bez osjetljivih podataka
    const userResponse = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatar: updatedUser.avatar,
      role: updatedUser.role.name,
      verified: updatedUser.verified,
      bio: updatedUser.bio,
    };

    return {
      message: "Profil uspješno ažuriran",
      user: userResponse,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage || "Došlo je do greške prilikom ažuriranja profila",
    });
  }
});
