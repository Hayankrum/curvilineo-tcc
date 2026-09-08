-- CreateTable
CREATE TABLE "Canal" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "autorId" INTEGER NOT NULL,

    CONSTRAINT "Canal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publicacao" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT,
    "conteudo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "canalId" INTEGER NOT NULL,
    "autorId" INTEGER NOT NULL,

    CONSTRAINT "Publicacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "publicacaoId" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT,
    "local" TEXT,
    "link" TEXT,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquete" (
    "id" SERIAL NOT NULL,
    "publicacaoId" INTEGER NOT NULL,
    "permiteMultiplaEscolha" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Enquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpcaoEnquete" (
    "id" SERIAL NOT NULL,
    "enqueteId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "OpcaoEnquete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voto" (
    "id" SERIAL NOT NULL,
    "enqueteId" INTEGER NOT NULL,
    "opcaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reacao" (
    "id" SERIAL NOT NULL,
    "publicacaoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Canal_autorId_idx" ON "Canal"("autorId");

-- CreateIndex
CREATE INDEX "Canal_ativo_idx" ON "Canal"("ativo");

-- CreateIndex
CREATE INDEX "Publicacao_canalId_idx" ON "Publicacao"("canalId");

-- CreateIndex
CREATE INDEX "Publicacao_autorId_idx" ON "Publicacao"("autorId");

-- CreateIndex
CREATE INDEX "Publicacao_tipo_idx" ON "Publicacao"("tipo");

-- CreateIndex
CREATE INDEX "Publicacao_criadoEm_idx" ON "Publicacao"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Evento_publicacaoId_key" ON "Evento"("publicacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquete_publicacaoId_key" ON "Enquete"("publicacaoId");

-- CreateIndex
CREATE INDEX "OpcaoEnquete_enqueteId_idx" ON "OpcaoEnquete"("enqueteId");

-- CreateIndex
CREATE UNIQUE INDEX "Voto_enqueteId_usuarioId_key" ON "Voto"("enqueteId", "usuarioId");

-- CreateIndex
CREATE INDEX "Voto_enqueteId_idx" ON "Voto"("enqueteId");

-- CreateIndex
CREATE INDEX "Voto_opcaoId_idx" ON "Voto"("opcaoId");

-- CreateIndex
CREATE INDEX "Voto_usuarioId_idx" ON "Voto"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Reacao_publicacaoId_usuarioId_key" ON "Reacao"("publicacaoId", "usuarioId");

-- CreateIndex
CREATE INDEX "Reacao_publicacaoId_idx" ON "Reacao"("publicacaoId");

-- CreateIndex
CREATE INDEX "Reacao_usuarioId_idx" ON "Reacao"("usuarioId");

-- AddForeignKey
ALTER TABLE "Canal" ADD CONSTRAINT "Canal_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_canalId_fkey" FOREIGN KEY ("canalId") REFERENCES "Canal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacao" ADD CONSTRAINT "Publicacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "Publicacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquete" ADD CONSTRAINT "Enquete_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "Publicacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpcaoEnquete" ADD CONSTRAINT "OpcaoEnquete_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "OpcaoEnquete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voto" ADD CONSTRAINT "Voto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reacao" ADD CONSTRAINT "Reacao_publicacaoId_fkey" FOREIGN KEY ("publicacaoId") REFERENCES "Publicacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reacao" ADD CONSTRAINT "Reacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
