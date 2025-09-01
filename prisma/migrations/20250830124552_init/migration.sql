-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "public"."Comparator" AS ENUM ('EQUALS', 'IN');

-- CreateTable
CREATE TABLE "public"."workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'READ_ONLY',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "defaultValue" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rules" (
    "id" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "comparator" "public"."Comparator" NOT NULL,
    "value" TEXT NOT NULL,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 100,
    "flagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "flagKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "flags_key_workspaceId_key" ON "public"."flags"("key", "workspaceId");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."flags" ADD CONSTRAINT "flags_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rules" ADD CONSTRAINT "rules_flagId_fkey" FOREIGN KEY ("flagId") REFERENCES "public"."flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_flagKey_workspaceId_fkey" FOREIGN KEY ("flagKey", "workspaceId") REFERENCES "public"."flags"("key", "workspaceId") ON DELETE SET NULL ON UPDATE CASCADE;
