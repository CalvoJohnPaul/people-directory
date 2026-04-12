/*
  Warnings:

  - You are about to drop the `otps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `person_face_embeddings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `people` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "person_face_embeddings" DROP CONSTRAINT "person_face_embeddings_personId_fkey";

-- AlterTable
ALTER TABLE "people" ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "otps";

-- DropTable
DROP TABLE "person_face_embeddings";

-- CreateTable
CREATE TABLE "face_embeddings" (
    "id" SERIAL NOT NULL,
    "embedding" vector NOT NULL,
    "personId" INTEGER NOT NULL,

    CONSTRAINT "face_embeddings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "face_embeddings" ADD CONSTRAINT "face_embeddings_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
