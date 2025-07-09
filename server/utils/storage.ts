import fs from "fs";
import path from "path";
import { promisify } from "util";

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

// Funkcija za upload datoteka u lokalni storage
// U budućnosti se može proširiti za upload na S3, Azure itd.
export async function uploadFile(
  sourcePath: string,
  destinationPath: string
): Promise<{ success: boolean; filePath: string }> {
  try {
    // Provjeri postoji li izvorišna datoteka
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source file ${sourcePath} does not exist`);
    }

    // Definiramo direktorij za upload
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const fullDestPath = path.join(uploadsDir, destinationPath);
    const destDir = path.dirname(fullDestPath);

    // Provjeri postoji li direktorij za destinaciju, ako ne, kreiraj ga
    if (!fs.existsSync(destDir)) {
      await mkdir(destDir, { recursive: true });
    }

    // Kopiraj datoteku
    await copyFile(sourcePath, fullDestPath);

    // Vrati putanju relativnu od 'public' direktorija za korištenje u klijentu
    return {
      success: true,
      filePath: `/uploads/${destinationPath}`,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}
