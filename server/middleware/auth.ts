import { H3Event, createError } from "h3";
import { verifyToken, UserTokenData } from "../utils/auth";

declare module "h3" {
  interface H3Event {
    user?: UserTokenData;
  }
}

export default defineEventHandler((event: H3Event) => {
  // Provjeri je li ruta auth-related (registracija i login nisu zaštićene)
  const path = getRequestURL(event).pathname;

  // Ukloni automatsku provjeru za auth rute
  if (path.includes("/api/auth/register") || path.includes("/api/auth/login")) {
    return;
  }

  // Provjeri zahtjeva li ruta autentifikaciju
  // Možete proširiti ovu logiku prema potrebama aplikacije
  const requiresAuth = path.includes("/api") && !path.includes("/api/public");

  if (!requiresAuth) {
    return;
  }

  try {
    // Dohvati token iz headera
    const authHeader = getRequestHeader(event, "authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentifikacija",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: "Potrebna je autentifikacija",
      });
    }

    // Verificiraj token
    const user = verifyToken(token);

    // Dodaj korisničke podatke u event objekt
    event.user = user;
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      statusMessage: error.message || "Nevažeći token",
    });
  }
});
