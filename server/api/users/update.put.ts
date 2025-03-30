import { H3Event, createError } from "h3";
import prisma from "~/lib/prisma";
import { z } from "zod";
import { hashPassword } from "~/server/utils/auth";

// Shema za validaciju podataka za ažuriranje korisnika
const updateUserSchema = z.object({
  userId: z.string().min(1, "ID korisnika je obavezan"),
  email: z.string().email("Unesite ispravnu email adresu").optional(),
  firstName: z.string().min(1, "Ime je obavezno").optional(),
  lastName: z.string().min(1, "Prezime je obavezno").optional(),
  roleId: z.string().optional(),
  password: z
    .string()
    .regex(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])(.{6,})$/,
      "Lozinka mora imati najmanje 6 znakova, jedno veliko slovo i jedan poseban znak"
    )
    .optional(),
  verified: z.boolean().optional(),
});

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
        statusMessage: "Nemate ovlasti za izmjenu korisnika",
      });
    }

    const body = await readBody(event);

    // Validiraj podatke za ažuriranje
    const validationResult = updateUserSchema.safeParse(body);

    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validationResult.error.errors[0].message,
      });
    }

    const validatedData = validationResult.data;
    const { userId, ...updateData } = validatedData;

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

    // Pripremamo podatke za ažuriranje
    const userData: any = {};

    if (updateData.email !== undefined) userData.email = updateData.email;
    if (updateData.firstName !== undefined)
      userData.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      userData.lastName = updateData.lastName;
    if (updateData.roleId !== undefined) userData.roleId = updateData.roleId;
    if (updateData.verified !== undefined)
      userData.verified = updateData.verified;

    // Ako je zadana nova lozinka, hashiraj je
    if (updateData.password) {
      userData.password = await hashPassword(updateData.password);
    }

    // Ažuriraj korisnika u bazi
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
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
      message: "Korisnik uspješno ažuriran",
      user: userResponse,
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage ||
        "Došlo je do greške prilikom ažuriranja korisnika",
    });
  }
});
