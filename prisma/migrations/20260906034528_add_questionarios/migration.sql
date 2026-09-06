-- CreateTable
CREATE TABLE "Questionario" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "autorId" INTEGER NOT NULL,

    CONSTRAINT "Questionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pergunta" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL,
    "configEscala" JSONB,
    "questionarioId" INTEGER NOT NULL,

    CONSTRAINT "Pergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opcao" (
    "id" SERIAL NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "perguntaId" INTEGER NOT NULL,

    CONSTRAINT "Opcao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resposta" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "questionarioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValorResposta" (
    "id" SERIAL NOT NULL,
    "respostaId" INTEGER NOT NULL,
    "perguntaId" INTEGER NOT NULL,
    "texto" TEXT,
    "opcaoId" INTEGER,
    "valorNumerico" INTEGER,

    CONSTRAINT "ValorResposta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Questionario_autorId_idx" ON "Questionario"("autorId");

-- CreateIndex
CREATE INDEX "Questionario_status_idx" ON "Questionario"("status");

-- CreateIndex
CREATE INDEX "Pergunta_questionarioId_idx" ON "Pergunta"("questionarioId");

-- CreateIndex
CREATE INDEX "Opcao_perguntaId_idx" ON "Opcao"("perguntaId");

-- CreateIndex
CREATE INDEX "Resposta_questionarioId_idx" ON "Resposta"("questionarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Resposta_usuarioId_questionarioId_key" ON "Resposta"("usuarioId", "questionarioId");

-- CreateIndex
CREATE INDEX "ValorResposta_respostaId_idx" ON "ValorResposta"("respostaId");

-- CreateIndex
CREATE INDEX "ValorResposta_perguntaId_idx" ON "ValorResposta"("perguntaId");

-- AddForeignKey
ALTER TABLE "Questionario" ADD CONSTRAINT "Questionario_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pergunta" ADD CONSTRAINT "Pergunta_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opcao" ADD CONSTRAINT "Opcao_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "Pergunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resposta" ADD CONSTRAINT "Resposta_questionarioId_fkey" FOREIGN KEY ("questionarioId") REFERENCES "Questionario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorResposta" ADD CONSTRAINT "ValorResposta_respostaId_fkey" FOREIGN KEY ("respostaId") REFERENCES "Resposta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorResposta" ADD CONSTRAINT "ValorResposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "Pergunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValorResposta" ADD CONSTRAINT "ValorResposta_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "Opcao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
