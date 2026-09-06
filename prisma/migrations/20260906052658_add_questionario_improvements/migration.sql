-- AlterTable
ALTER TABLE "Pergunta" ADD COLUMN     "condicoes" JSONB;

-- AlterTable
ALTER TABLE "Questionario" ADD COLUMN     "anonimo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "corTema" TEXT DEFAULT '#6366f1',
ADD COLUMN     "encerraEm" TIMESTAMP(3);
