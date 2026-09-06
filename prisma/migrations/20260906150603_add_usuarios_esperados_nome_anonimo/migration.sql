-- AlterTable
ALTER TABLE "Questionario" ADD COLUMN     "usuariosEsperados" INTEGER;

-- AlterTable
ALTER TABLE "Resposta" ADD COLUMN     "nomeAnonimo" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "notificarQuestionarios" BOOLEAN NOT NULL DEFAULT true;
