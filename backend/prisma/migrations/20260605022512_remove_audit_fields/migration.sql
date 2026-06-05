/*
  Warnings:

  - You are about to drop the column `createdById` on the `CompatibilidadTransfusional` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `CompatibilidadTransfusional` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `CompatibilidadTransfusional` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Donacion` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Donacion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Donacion` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Donante` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Donante` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Donante` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `EstudioGestante` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `EstudioGestante` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `EstudioGestante` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Gestante` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Gestante` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Gestante` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `GrupoSanguineo` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `GrupoSanguineo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `GrupoSanguineo` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Paciente` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `RecienNacido` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `RecienNacido` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `RecienNacido` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `ResultadoCoombs` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `ResultadoCoombs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `ResultadoCoombs` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `ResultadoSerologia` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `ResultadoSerologia` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `ResultadoSerologia` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Transfusion` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `Transfusion` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Transfusion` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompatibilidadTransfusional" DROP CONSTRAINT "CompatibilidadTransfusional_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CompatibilidadTransfusional" DROP CONSTRAINT "CompatibilidadTransfusional_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "CompatibilidadTransfusional" DROP CONSTRAINT "CompatibilidadTransfusional_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Donacion" DROP CONSTRAINT "Donacion_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Donacion" DROP CONSTRAINT "Donacion_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Donacion" DROP CONSTRAINT "Donacion_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Donante" DROP CONSTRAINT "Donante_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Donante" DROP CONSTRAINT "Donante_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Donante" DROP CONSTRAINT "Donante_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "EstudioGestante" DROP CONSTRAINT "EstudioGestante_createdById_fkey";

-- DropForeignKey
ALTER TABLE "EstudioGestante" DROP CONSTRAINT "EstudioGestante_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "EstudioGestante" DROP CONSTRAINT "EstudioGestante_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Gestante" DROP CONSTRAINT "Gestante_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Gestante" DROP CONSTRAINT "Gestante_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Gestante" DROP CONSTRAINT "Gestante_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "GrupoSanguineo" DROP CONSTRAINT "GrupoSanguineo_createdById_fkey";

-- DropForeignKey
ALTER TABLE "GrupoSanguineo" DROP CONSTRAINT "GrupoSanguineo_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "GrupoSanguineo" DROP CONSTRAINT "GrupoSanguineo_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Paciente" DROP CONSTRAINT "Paciente_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Persona" DROP CONSTRAINT "Persona_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Persona" DROP CONSTRAINT "Persona_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Persona" DROP CONSTRAINT "Persona_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "RecienNacido" DROP CONSTRAINT "RecienNacido_createdById_fkey";

-- DropForeignKey
ALTER TABLE "RecienNacido" DROP CONSTRAINT "RecienNacido_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "RecienNacido" DROP CONSTRAINT "RecienNacido_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "ResultadoCoombs" DROP CONSTRAINT "ResultadoCoombs_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ResultadoCoombs" DROP CONSTRAINT "ResultadoCoombs_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "ResultadoCoombs" DROP CONSTRAINT "ResultadoCoombs_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "ResultadoSerologia" DROP CONSTRAINT "ResultadoSerologia_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ResultadoSerologia" DROP CONSTRAINT "ResultadoSerologia_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "ResultadoSerologia" DROP CONSTRAINT "ResultadoSerologia_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Transfusion" DROP CONSTRAINT "Transfusion_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Transfusion" DROP CONSTRAINT "Transfusion_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "Transfusion" DROP CONSTRAINT "Transfusion_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_createdById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_deletedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_updatedById_fkey";

-- AlterTable
ALTER TABLE "CompatibilidadTransfusional" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Donacion" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Donante" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "EstudioGestante" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Gestante" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "GrupoSanguineo" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Paciente" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Persona" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "RecienNacido" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "ResultadoCoombs" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "ResultadoSerologia" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "Transfusion" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdById",
DROP COLUMN "deletedById",
DROP COLUMN "updatedById";
