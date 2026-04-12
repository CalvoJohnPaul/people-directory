-- CreateTable
CREATE TABLE "otps" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "email_address" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otps_code_key" ON "otps"("code");

-- CreateIndex
CREATE UNIQUE INDEX "otps_email_address_key" ON "otps"("email_address");
