import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  BucketAlreadyOwnedByYou,
  BucketAlreadyExists,
  ListBucketsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Dohvati podatke iz env varijabli
const minioEndpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000";
const minioAccessKey = process.env.MINIO_ACCESS_KEY || "admin";
const minioSecretKey = process.env.MINIO_SECRET_KEY || "adminpassword";
const bucketName = process.env.MINIO_BUCKET_NAME || "avatars";

console.log("MinIO konfiguracija:", {
  endpoint: minioEndpoint,
  accessKey: minioAccessKey ? "***" : "nije postavljen",
  secretKey: minioSecretKey ? "***" : "nije postavljen",
  bucketName,
});

// Provjeri je li endpoint u ispravnom formatu
function getValidEndpoint(endpoint: string): string {
  try {
    // Provjeri je li endpoint već validan URL, ako jest vrati ga
    new URL(endpoint);
    return endpoint;
  } catch (e) {
    // Ako nije, dodaj http:// prefix
    console.log(
      `Endpoint ${endpoint} nije validan URL, dodajem http:// prefix`
    );
    return `http://${endpoint}`;
  }
}

// Osiguraj da endpoint ima ispravan format
const validEndpoint = getValidEndpoint(minioEndpoint);

// Konfiguracija MinIO klijenta
const s3Client = new S3Client({
  endpoint: validEndpoint,
  region: "us-east-1", // MinIO zahtijeva region iako se ne koristi
  credentials: {
    accessKeyId: minioAccessKey,
    secretAccessKey: minioSecretKey,
  },
  forcePathStyle: true, // Neophodno za MinIO
});

/**
 * Ispis svih dostupnih bucketa za debagiranje
 */
async function listAllBuckets() {
  try {
    console.log("Dohvaćam listu svih bucketa...");
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    console.log(
      "Dostupni bucketi:",
      Buckets?.map((b) => b.Name).join(", ") || "Nema dostupnih bucketa"
    );
    return Buckets;
  } catch (error) {
    console.error("Greška pri dohvatu liste bucketa:", error);
    return [];
  }
}

/**
 * Inicijalizira bucket ako ne postoji
 */
async function initBucket() {
  try {
    // Provjeri dostupne buckete
    await listAllBuckets();

    // Provjeri postoji li bucket
    console.log(`Provjeravam postoji li bucket ${bucketName}...`);
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket ${bucketName} već postoji.`);
    return true;
  } catch (error: any) {
    console.log(
      `Bucket ${bucketName} ne postoji ili nije dostupan:`,
      error.message
    );

    try {
      // Kreiraj bucket
      console.log(`Pokušavam kreirati bucket ${bucketName}...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket ${bucketName} uspješno kreiran.`);
      return true;
    } catch (err: any) {
      // Ignoriraj ako bucket već postoji (možda je stvoren između provjere i kreiranja)
      if (
        err instanceof BucketAlreadyOwnedByYou ||
        err instanceof BucketAlreadyExists ||
        err.name === "BucketAlreadyOwnedByYou" ||
        err.name === "BucketAlreadyExists"
      ) {
        console.log(`Bucket ${bucketName} već postoji (dvostruka provjera).`);
        return true;
      } else {
        console.error(`Greška pri kreiranju bucketa ${bucketName}:`, err);
        return false;
      }
    }
  }
}

// Inicijaliziraj bucket prilikom učitavanja modula
initBucket().catch((err) => {
  console.error("Greška pri inicijalizaciji S3 bucketa:", err);
});

/**
 * Sprema sliku u S3 bucket
 * @param fileName Ime datoteke
 * @param fileBuffer Buffer s podacima datoteke
 * @param contentType MIME tip datoteke
 * @param folder Folder unutar bucketa (npr. 'avatars', 'profiles')
 * @returns URL putanja do slike
 */
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
  folder: string = "avatars"
): Promise<string> {
  // Osiguraj da bucket postoji
  const bucketExists = await initBucket();
  if (!bucketExists) {
    throw new Error(
      `Bucket ${bucketName} nije dostupan ili ga nije moguće kreirati`
    );
  }

  const key = `${folder}/${Date.now()}-${fileName}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    console.log(
      `Pokušavam upload datoteke ${fileName} (veličina: ${fileBuffer.length} bytes) u bucket ${bucketName}/${folder}`
    );
    const result = await s3Client.send(new PutObjectCommand(params));
    console.log(`Datoteka uspješno uploadana s rezultatom:`, result);
    return key;
  } catch (error) {
    console.error("Greška prilikom uploada datoteke:", error);
    throw error;
  }
}

/**
 * Provjerava postoji li datoteka u S3 bucketu
 * @param key Ključ (putanja) datoteke u bucketu
 * @returns boolean Vraća true ako datoteka postoji, inače false
 */
export async function fileExists(key: string): Promise<boolean> {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    console.log(
      `Provjeravanje postojanja datoteke ${key} u bucketu ${bucketName}`
    );
    await s3Client.send(new GetObjectCommand(params));
    console.log(`Datoteka ${key} postoji u bucketu`);
    return true;
  } catch (error: any) {
    // Ako datoteka ne postoji, S3 vraća grešku NoSuchKey
    if (error.name === "NoSuchKey" || error.$metadata?.httpStatusCode === 404) {
      console.log(`Datoteka ${key} ne postoji u bucketu`);
      return false;
    }
    // Ako je neka druga greška, logiraj i proslijedi
    console.error(`Greška pri provjeri postojanja datoteke ${key}:`, error);
    throw error;
  }
}

/**
 * Vraća URL za preuzimanje slike iz S3 bucketa
 * @param key Ključ (putanja) datoteke u bucketu
 * @returns URL za preuzimanje datoteke ili null ako datoteka ne postoji
 */
export async function getFileUrl(key: string): Promise<string | null> {
  try {
    // Prvo provjeri postoji li datoteka
    const exists = await fileExists(key);
    if (!exists) {
      console.log(`Datoteka ${key} ne postoji, vraćam null umjesto URL-a`);
      return null;
    }

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    console.log(
      `Generiranje presigned URL-a za ${key} u bucketu ${bucketName}`
    );
    const command = new GetObjectCommand(params);
    // URL vrijedi 1 sat
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log(`Presigned URL generiran: ${url.substring(0, 100)}...`);
    return url;
  } catch (error) {
    console.error("Greška pri generiranju presigned URL-a:", error);
    return null; // Vrati null umjesto bacanja greške
  }
}

/**
 * Briše datoteku iz S3 bucketa
 * @param key Ključ (putanja) datoteke u bucketu
 */
export async function deleteFile(key: string): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    console.log(`Brisanje datoteke ${key} iz bucketa ${bucketName}`);
    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Datoteka ${key} uspješno obrisana`);
  } catch (error) {
    console.error("Greška pri brisanju datoteke iz S3:", error);
    throw error;
  }
}
