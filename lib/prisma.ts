import { PrismaClient } from "@prisma/client";

// Deklaracija za proširenje globalnog tipa
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Provjera da se ne bi kreiralo više instanci Prisma klijenta
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // U development modu, koristimo global objekt da sačuvamo instancu
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.prisma;
}

export default prisma;
