-- AlterTable
ALTER TABLE "Questionario" ADD COLUMN     "turmaId" INTEGER;

-- AlterTable
ALTER TABLE "Turma" ADD COLUMN     "responsavelId" INTEGER;

-- CreateIndex
CREATE INDEX "Questionario_turmaId_idx" ON "Questionario"("turmaId");

-- CreateIndex
CREATE INDEX "Turma_responsavelId_idx" ON "Turma"("responsavelId");

-- AddForeignKey
ALTER TABLE "Questionario" ADD CONSTRAINT "Questionario_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
