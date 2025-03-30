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
  disabled: z.boolean().optional(),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Provjeri autentikaciju
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

    // Dohvati podatke iz zahtjeva
    const {
      userId,
      email,
      firstName,
      lastName,
      password,
      roleId,
      verified,
      disabled,
    } = await readBody(event);

    // Provjeri je li userId poslan
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID korisnika je obavezan",
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

    // Pripremi podatke za ažuriranje
    const updateData: any = {};

    // Dodaj samo promijenjene vrijednosti
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (verified !== undefined) updateData.verified = verified;
    if (roleId !== undefined) updateData.roleId = roleId;

    // Postavi ili resetiraj disabled status
    if (disabled === true) {
      // Postavi disabled na trenutno vrijeme
      updateData.disabled = new Date();
    } else if (disabled === false) {
      // Resetiraj disabled na null
      updateData.disabled = null;
    }

    // Ako je password poslan, hashiraj ga
    if (password) {
      updateData.password = await hashPassword(password);
    }

    // Ažuriraj korisnika
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: true,
      },
    });

    // Izostavi lozinku iz odgovora
    const { password: _, ...userWithoutPassword } = updatedUser;

    return {
      success: true,
      message: "Korisnik je uspješno ažuriran",
      user: {
        ...userWithoutPassword,
        role: updatedUser.role.name,
      },
    };
  } catch (error: any) {
    console.error("Greška pri ažuriranju korisnika:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage:
        error.statusMessage ||
        "Došlo je do greške prilikom ažuriranja korisnika",
    });
  }
});
