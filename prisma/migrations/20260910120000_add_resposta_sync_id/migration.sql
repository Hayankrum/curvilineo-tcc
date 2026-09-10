-- Add syncId to Resposta for idempotent offline sync
ALTER TABLE "Resposta" ADD COLUMN "syncId" TEXT;
CREATE UNIQUE INDEX "Resposta_syncId_key" ON "Resposta"("syncId");