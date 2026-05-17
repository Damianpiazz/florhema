-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'INVITADO');

-- CreateEnum
CREATE TYPE "EstadoAptitud" AS ENUM ('VERDE', 'AMARILLO', 'ROJO');

-- CreateEnum
CREATE TYPE "TipoDonacion" AS ENUM ('VOLUNTARIA', 'REPOSICION');

-- CreateEnum
CREATE TYPE "TipoHemocomponente" AS ENUM ('GLOBULOS_ROJOS', 'PLASMA', 'PLAQUETAS', 'CRIOPRECIPITADO');

-- CreateEnum
CREATE TYPE "EstadoEstudio" AS ENUM ('PENDIENTE', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TipoABO" AS ENUM ('A', 'B', 'AB', 'O');

-- CreateEnum
CREATE TYPE "FactorRh" AS ENUM ('POSITIVO', 'NEGATIVO');

-- CreateEnum
CREATE TYPE "TipoCoombs" AS ENUM ('DIRECTO', 'INDIRECTO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoSanguineo" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoABO" NOT NULL,
    "factorRh" "FactorRh" NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GrupoSanguineo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoSerologia" (
    "id" SERIAL NOT NULL,
    "hiv" BOOLEAN NOT NULL DEFAULT false,
    "hcv" BOOLEAN NOT NULL DEFAULT false,
    "hbv" BOOLEAN NOT NULL DEFAULT false,
    "chagas" BOOLEAN NOT NULL DEFAULT false,
    "sifilis" BOOLEAN NOT NULL DEFAULT false,
    "donacionId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ResultadoSerologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoCoombs" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoCoombs" NOT NULL,
    "positivo" BOOLEAN NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ResultadoCoombs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompatibilidadTransfusional" (
    "id" SERIAL NOT NULL,
    "compatible" BOOLEAN NOT NULL,
    "motivoIncompatibilidad" TEXT,
    "donanteGrupoId" INTEGER NOT NULL,
    "receptorGrupoId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CompatibilidadTransfusional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" SERIAL NOT NULL,
    "dni" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "grupoSanguineoId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donante" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "semaforoAptitud" "EstadoAptitud" NOT NULL DEFAULT 'VERDE',
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Donante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donacion" (
    "id" SERIAL NOT NULL,
    "donanteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "tensionArterial" TEXT NOT NULL,
    "hemoglobina" DOUBLE PRECISION NOT NULL,
    "reaccionAdversa" TEXT,
    "tipoDonacion" "TipoDonacion" NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Donacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfusion" (
    "id" SERIAL NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "componente" "TipoHemocomponente" NOT NULL,
    "cantidadUnidades" INTEGER NOT NULL,
    "reaccionAdversa" TEXT,
    "compatibilidadId" INTEGER,
    "resultadoCoombsId" INTEGER,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Transfusion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gestante" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "antecedentesObstetricos" TEXT,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Gestante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstudioGestante" (
    "id" SERIAL NOT NULL,
    "gestanteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "compatibilidadConyugal" TEXT,
    "estadoEstudio" "EstadoEstudio" NOT NULL DEFAULT 'PENDIENTE',
    "pruebaCoombsIndirectaId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EstudioGestante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecienNacido" (
    "id" SERIAL NOT NULL,
    "personaId" INTEGER NOT NULL,
    "gestanteId" INTEGER NOT NULL,
    "pruebaCoombsDirectaId" INTEGER NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RecienNacido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoSanguineo_tipo_factorRh_key" ON "GrupoSanguineo"("tipo", "factorRh");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoSerologia_donacionId_key" ON "ResultadoSerologia"("donacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_dni_key" ON "Persona"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Donante_personaId_key" ON "Donante"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_personaId_key" ON "Paciente"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "Transfusion_compatibilidadId_key" ON "Transfusion"("compatibilidadId");

-- CreateIndex
CREATE UNIQUE INDEX "Transfusion_resultadoCoombsId_key" ON "Transfusion"("resultadoCoombsId");

-- CreateIndex
CREATE UNIQUE INDEX "Gestante_personaId_key" ON "Gestante"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "EstudioGestante_pruebaCoombsIndirectaId_key" ON "EstudioGestante"("pruebaCoombsIndirectaId");

-- CreateIndex
CREATE UNIQUE INDEX "RecienNacido_personaId_key" ON "RecienNacido"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "RecienNacido_pruebaCoombsDirectaId_key" ON "RecienNacido"("pruebaCoombsDirectaId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoSanguineo" ADD CONSTRAINT "GrupoSanguineo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoSanguineo" ADD CONSTRAINT "GrupoSanguineo_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoSanguineo" ADD CONSTRAINT "GrupoSanguineo_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoSerologia" ADD CONSTRAINT "ResultadoSerologia_donacionId_fkey" FOREIGN KEY ("donacionId") REFERENCES "Donacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoSerologia" ADD CONSTRAINT "ResultadoSerologia_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoSerologia" ADD CONSTRAINT "ResultadoSerologia_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoSerologia" ADD CONSTRAINT "ResultadoSerologia_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoCoombs" ADD CONSTRAINT "ResultadoCoombs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoCoombs" ADD CONSTRAINT "ResultadoCoombs_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoCoombs" ADD CONSTRAINT "ResultadoCoombs_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilidadTransfusional" ADD CONSTRAINT "CompatibilidadTransfusional_donanteGrupoId_fkey" FOREIGN KEY ("donanteGrupoId") REFERENCES "GrupoSanguineo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilidadTransfusional" ADD CONSTRAINT "CompatibilidadTransfusional_receptorGrupoId_fkey" FOREIGN KEY ("receptorGrupoId") REFERENCES "GrupoSanguineo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilidadTransfusional" ADD CONSTRAINT "CompatibilidadTransfusional_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilidadTransfusional" ADD CONSTRAINT "CompatibilidadTransfusional_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompatibilidadTransfusional" ADD CONSTRAINT "CompatibilidadTransfusional_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_grupoSanguineoId_fkey" FOREIGN KEY ("grupoSanguineoId") REFERENCES "GrupoSanguineo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donante" ADD CONSTRAINT "Donante_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donante" ADD CONSTRAINT "Donante_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donante" ADD CONSTRAINT "Donante_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donante" ADD CONSTRAINT "Donante_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_donanteId_fkey" FOREIGN KEY ("donanteId") REFERENCES "Donante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donacion" ADD CONSTRAINT "Donacion_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paciente" ADD CONSTRAINT "Paciente_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfusion" ADD CONSTRAINT "Transfusion_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfusion" ADD CONSTRAINT "Transfusion_compatibilidadId_fkey" FOREIGN KEY ("compatibilidadId") REFERENCES "CompatibilidadTransfusional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfusion" ADD CONSTRAINT "Transfusion_resultadoCoombsId_fkey" FOREIGN KEY ("resultadoCoombsId") REFERENCES "ResultadoCoombs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfusion" ADD CONSTRAINT "Transfusion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfusion" ADD CONSTRAINT "Transfusion_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfusion" ADD CONSTRAINT "Transfusion_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestante" ADD CONSTRAINT "Gestante_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestante" ADD CONSTRAINT "Gestante_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestante" ADD CONSTRAINT "Gestante_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gestante" ADD CONSTRAINT "Gestante_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudioGestante" ADD CONSTRAINT "EstudioGestante_gestanteId_fkey" FOREIGN KEY ("gestanteId") REFERENCES "Gestante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudioGestante" ADD CONSTRAINT "EstudioGestante_pruebaCoombsIndirectaId_fkey" FOREIGN KEY ("pruebaCoombsIndirectaId") REFERENCES "ResultadoCoombs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudioGestante" ADD CONSTRAINT "EstudioGestante_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudioGestante" ADD CONSTRAINT "EstudioGestante_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudioGestante" ADD CONSTRAINT "EstudioGestante_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecienNacido" ADD CONSTRAINT "RecienNacido_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecienNacido" ADD CONSTRAINT "RecienNacido_gestanteId_fkey" FOREIGN KEY ("gestanteId") REFERENCES "Gestante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecienNacido" ADD CONSTRAINT "RecienNacido_pruebaCoombsDirectaId_fkey" FOREIGN KEY ("pruebaCoombsDirectaId") REFERENCES "ResultadoCoombs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecienNacido" ADD CONSTRAINT "RecienNacido_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecienNacido" ADD CONSTRAINT "RecienNacido_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecienNacido" ADD CONSTRAINT "RecienNacido_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
