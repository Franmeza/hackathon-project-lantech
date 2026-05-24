-- Existing cards have no owner; clear before adding required userId
DELETE FROM "Card";

-- AlterTable
ALTER TABLE "Card" ADD COLUMN "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Card_userId_idx" ON "Card"("userId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
