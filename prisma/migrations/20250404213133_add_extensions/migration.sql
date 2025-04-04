-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "images" TEXT[],
ADD COLUMN     "jsonContent" TEXT;

-- CreateTable
CREATE TABLE "Extension" (
    "id" TEXT NOT NULL,
    "extensionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Extension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileExtension" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "extensionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileExtension_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Extension_extensionId_key" ON "Extension"("extensionId");

-- CreateIndex
CREATE INDEX "ProfileExtension_profileId_idx" ON "ProfileExtension"("profileId");

-- CreateIndex
CREATE INDEX "ProfileExtension_extensionId_idx" ON "ProfileExtension"("extensionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileExtension_profileId_extensionId_key" ON "ProfileExtension"("profileId", "extensionId");

-- AddForeignKey
ALTER TABLE "ProfileExtension" ADD CONSTRAINT "ProfileExtension_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileExtension" ADD CONSTRAINT "ProfileExtension_extensionId_fkey" FOREIGN KEY ("extensionId") REFERENCES "Extension"("id") ON DELETE CASCADE ON UPDATE CASCADE;
