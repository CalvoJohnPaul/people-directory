CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "gender" "Gender",
    "date_of_birth" TIMESTAMP(3),
    "image" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "email_address_verified_at" TIMESTAMP(3),
    "mobile_number" TEXT,
    "mobile_number_verified_at" TIMESTAMP(3),
    "current_address" TEXT,
    "permanent_address" TEXT,
    "password" TEXT NOT NULL,
    "id_document" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_embeddings" (
    "id" SERIAL NOT NULL,
    "embedding" VECTOR NOT NULL,
    "personId" INTEGER NOT NULL,

    CONSTRAINT "face_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "private" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "people_email_address_key" ON "people"("email_address");

-- CreateIndex
CREATE UNIQUE INDEX "people_mobile_number_key" ON "people"("mobile_number");

-- CreateIndex
CREATE UNIQUE INDEX "otps_code_key" ON "otps"("code");

-- CreateIndex
CREATE UNIQUE INDEX "otps_email_address_key" ON "otps"("email_address");

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_url_key" ON "uploaded_files"("url");

-- AddForeignKey
ALTER TABLE "face_embeddings" ADD CONSTRAINT "face_embeddings_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
