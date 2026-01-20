-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('flood', 'power_outage');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('active', 'resolved', 'investigating');

-- CreateTable
CREATE TABLE "localities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "province" TEXT NOT NULL DEFAULT 'tucuman',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "localities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "severity" SMALLINT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'active',
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "rejections" INTEGER NOT NULL DEFAULT 0,
    "validation_score" INTEGER NOT NULL DEFAULT 0,
    "auto_hidden" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "device_fingerprints" TEXT[],
    "reported_by" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "locality_id" TEXT NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "vote_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_validations" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "last_report_at" TIMESTAMP(3),
    "last_vote_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_validations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "localities_name_key" ON "localities"("name");

-- CreateIndex
CREATE INDEX "alerts_locality_id_idx" ON "alerts"("locality_id");

-- CreateIndex
CREATE INDEX "alerts_status_idx" ON "alerts"("status");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alerts_auto_hidden_idx" ON "alerts"("auto_hidden");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "votes_device_id_idx" ON "votes"("device_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_alert_id_device_id_key" ON "votes"("alert_id", "device_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_validations_device_id_key" ON "device_validations"("device_id");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_locality_id_fkey" FOREIGN KEY ("locality_id") REFERENCES "localities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
