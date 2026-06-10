-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'WORKER');

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('OWNER', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."RDOStatus" AS ENUM ('DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."WeatherCondition" AS ENUM ('SUNNY', 'PARTLY_CLOUDY', 'CLOUDY', 'RAINY', 'STORMY', 'WINDY', 'FOGGY');

-- CreateEnum
CREATE TYPE "public"."EquipmentStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'BROKEN', 'RETIRED');

-- CreateEnum
CREATE TYPE "public"."PhotoCategory" AS ENUM ('GENERAL', 'PROGRESS', 'ISSUE', 'SAFETY', 'MATERIAL', 'EQUIPMENT', 'INSPECTION');

-- CreateEnum
CREATE TYPE "public"."BIMElementStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."EmergencyType" AS ENUM ('PANIC', 'ACCIDENT', 'FIRE', 'MEDICAL', 'STRUCTURAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."EmergencyStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM');

-- CreateEnum
CREATE TYPE "public"."SyncAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "public"."SyncStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'WORKER',
    "phone" TEXT,
    "cpf" TEXT,
    "crea" TEXT,
    "art" TEXT,
    "rrt" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "companyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "expectedEndDate" TIMESTAMP(3),
    "actualEndDate" TIMESTAMP(3),
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "bimModelUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMember" (
    "id" TEXT NOT NULL,
    "role" "public"."MemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RDO" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL,
    "status" "public"."RDOStatus" NOT NULL DEFAULT 'DRAFT',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "weatherCondition" "public"."WeatherCondition",
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "windSpeed" DOUBLE PRECISION,
    "weatherNotes" TEXT,
    "workStartTime" TIMESTAMP(3),
    "workEndTime" TIMESTAMP(3),
    "lunchStartTime" TIMESTAMP(3),
    "lunchEndTime" TIMESTAMP(3),
    "activities" TEXT,
    "observations" TEXT,
    "issues" TEXT,
    "localId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "RDO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workforce" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "hoursWorked" DOUBLE PRECISION,
    "notes" TEXT,
    "rdoId" TEXT NOT NULL,

    CONSTRAINT "Workforce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNumber" TEXT,
    "plate" TEXT,
    "qrCode" TEXT,
    "barcode" TEXT,
    "status" "public"."EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "lastMaintenance" TIMESTAMP(3),
    "nextMaintenance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EquipmentUsage" (
    "id" TEXT NOT NULL,
    "horimeterStart" DOUBLE PRECISION,
    "horimeterEnd" DOUBLE PRECISION,
    "hoursUsed" DOUBLE PRECISION,
    "fuelConsumed" DOUBLE PRECISION,
    "operatorName" TEXT,
    "notes" TEXT,
    "equipmentId" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,

    CONSTRAINT "EquipmentUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
    "size" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "compassBearing" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hasMarkup" BOOLEAN NOT NULL DEFAULT false,
    "markupData" TEXT,
    "category" "public"."PhotoCategory" NOT NULL DEFAULT 'GENERAL',
    "description" TEXT,
    "tags" TEXT[],
    "scannedCode" TEXT,
    "scannedCodeType" TEXT,
    "localId" TEXT,
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "rdoId" TEXT,
    "uploadedById" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Signature" (
    "id" TEXT NOT NULL,
    "imageData" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "deviceInfo" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "rdoId" TEXT NOT NULL,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BIMElement" (
    "id" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "status" "public"."BIMElementStatus" NOT NULL DEFAULT 'PLANNED',
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bcfTopic" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "BIMElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Emergency" (
    "id" TEXT NOT NULL,
    "type" "public"."EmergencyType" NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "status" "public"."EmergencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "triggeredById" TEXT NOT NULL,

    CONSTRAINT "Emergency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SyncQueue" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "public"."SyncAction" NOT NULL,
    "payload" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "status" "public"."SyncStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "SyncQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "public"."User"("cpf");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "public"."User"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "public"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "public"."Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "public"."Company"("cnpj");

-- CreateIndex
CREATE INDEX "Project_companyId_idx" ON "public"."Project"("companyId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "public"."Project"("status");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "public"."ProjectMember"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_userId_projectId_key" ON "public"."ProjectMember"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RDO_localId_key" ON "public"."RDO"("localId");

-- CreateIndex
CREATE INDEX "RDO_projectId_date_idx" ON "public"."RDO"("projectId", "date");

-- CreateIndex
CREATE INDEX "RDO_createdById_idx" ON "public"."RDO"("createdById");

-- CreateIndex
CREATE INDEX "RDO_status_idx" ON "public"."RDO"("status");

-- CreateIndex
CREATE INDEX "RDO_localId_idx" ON "public"."RDO"("localId");

-- CreateIndex
CREATE UNIQUE INDEX "RDO_projectId_number_key" ON "public"."RDO"("projectId", "number");

-- CreateIndex
CREATE INDEX "Workforce_rdoId_idx" ON "public"."Workforce"("rdoId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_qrCode_key" ON "public"."Equipment"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_barcode_key" ON "public"."Equipment"("barcode");

-- CreateIndex
CREATE INDEX "Equipment_projectId_idx" ON "public"."Equipment"("projectId");

-- CreateIndex
CREATE INDEX "Equipment_qrCode_idx" ON "public"."Equipment"("qrCode");

-- CreateIndex
CREATE INDEX "Equipment_barcode_idx" ON "public"."Equipment"("barcode");

-- CreateIndex
CREATE INDEX "EquipmentUsage_rdoId_idx" ON "public"."EquipmentUsage"("rdoId");

-- CreateIndex
CREATE INDEX "EquipmentUsage_equipmentId_idx" ON "public"."EquipmentUsage"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_localId_key" ON "public"."Photo"("localId");

-- CreateIndex
CREATE INDEX "Photo_projectId_idx" ON "public"."Photo"("projectId");

-- CreateIndex
CREATE INDEX "Photo_rdoId_idx" ON "public"."Photo"("rdoId");

-- CreateIndex
CREATE INDEX "Photo_category_idx" ON "public"."Photo"("category");

-- CreateIndex
CREATE INDEX "Photo_localId_idx" ON "public"."Photo"("localId");

-- CreateIndex
CREATE INDEX "Signature_rdoId_idx" ON "public"."Signature"("rdoId");

-- CreateIndex
CREATE INDEX "Signature_userId_idx" ON "public"."Signature"("userId");

-- CreateIndex
CREATE INDEX "BIMElement_projectId_idx" ON "public"."BIMElement"("projectId");

-- CreateIndex
CREATE INDEX "BIMElement_status_idx" ON "public"."BIMElement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BIMElement_projectId_guid_key" ON "public"."BIMElement"("projectId", "guid");

-- CreateIndex
CREATE INDEX "Emergency_projectId_idx" ON "public"."Emergency"("projectId");

-- CreateIndex
CREATE INDEX "Emergency_status_idx" ON "public"."Emergency"("status");

-- CreateIndex
CREATE INDEX "SyncQueue_status_idx" ON "public"."SyncQueue"("status");

-- CreateIndex
CREATE INDEX "SyncQueue_entityType_entityId_idx" ON "public"."SyncQueue"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RDO" ADD CONSTRAINT "RDO_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RDO" ADD CONSTRAINT "RDO_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workforce" ADD CONSTRAINT "Workforce_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "public"."RDO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Equipment" ADD CONSTRAINT "Equipment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EquipmentUsage" ADD CONSTRAINT "EquipmentUsage_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "public"."Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EquipmentUsage" ADD CONSTRAINT "EquipmentUsage_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "public"."RDO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "public"."RDO"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Signature" ADD CONSTRAINT "Signature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Signature" ADD CONSTRAINT "Signature_rdoId_fkey" FOREIGN KEY ("rdoId") REFERENCES "public"."RDO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BIMElement" ADD CONSTRAINT "BIMElement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Emergency" ADD CONSTRAINT "Emergency_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Emergency" ADD CONSTRAINT "Emergency_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
