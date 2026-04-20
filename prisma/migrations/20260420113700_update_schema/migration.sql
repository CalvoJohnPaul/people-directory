-- DropForeignKey
ALTER TABLE "face_embeddings" DROP CONSTRAINT "face_embeddings_personId_fkey";

-- AddForeignKey
ALTER TABLE "face_embeddings" ADD CONSTRAINT "face_embeddings_personId_fkey" FOREIGN KEY ("personId") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
