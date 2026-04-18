/*
  Warnings:

  - You are about to drop the column `current_address` on the `people` table. All the data in the column will be lost.
  - You are about to drop the column `id_document` on the `people` table. All the data in the column will be lost.
  - You are about to drop the column `permanent_address` on the `people` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "people" DROP COLUMN "current_address",
DROP COLUMN "id_document",
DROP COLUMN "permanent_address",
ADD COLUMN     "address" TEXT;
