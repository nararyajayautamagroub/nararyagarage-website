-- CreateEnum
CREATE TYPE "RecruitmentStatus" AS ENUM ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "RecruitmentApplication" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "desiredRole" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "experience" TEXT,
    "portfolioUrl" TEXT,
    "status" "RecruitmentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecruitmentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetVehicle" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT,
    "game" TEXT,
    "chassis" TEXT,
    "body" TEXT,
    "livery" TEXT,
    "screenshotUrl" TEXT,
    "description" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecruitmentApplication_memberId_status_idx" ON "RecruitmentApplication"("memberId", "status");

-- CreateIndex
CREATE INDEX "RecruitmentApplication_status_createdAt_idx" ON "RecruitmentApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FleetVehicle_memberId_status_idx" ON "FleetVehicle"("memberId", "status");

-- CreateIndex
CREATE INDEX "FleetVehicle_status_createdAt_idx" ON "FleetVehicle"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "RecruitmentApplication" ADD CONSTRAINT "RecruitmentApplication_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetVehicle" ADD CONSTRAINT "FleetVehicle_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
