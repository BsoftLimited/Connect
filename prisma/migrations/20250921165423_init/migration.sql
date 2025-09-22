/*
  Warnings:

  - You are about to drop the column `allowQuestDownload` on the `SiteConfig` table. All the data in the column will be lost.
  - You are about to drop the column `allowQuestSignup` on the `SiteConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminID" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Connect',
    "siteLogo" TEXT NOT NULL DEFAULT '/logo.svg',
    "siteFavicon" TEXT NOT NULL DEFAULT '/favicon.ico',
    "siteUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000',
    "siteDescription" TEXT NOT NULL DEFAULT 'Connect - The ultimate platform for managing your applications and services.',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'The site is under maintenance. Please check back later.',
    "allowGuestSignup" BOOLEAN NOT NULL DEFAULT true,
    "allowGuestDownload" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "SiteConfig_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SiteConfig" ("adminID", "createdAt", "id", "maintenanceMessage", "maintenanceMode", "siteDescription", "siteFavicon", "siteLogo", "siteName", "siteUrl", "updatedAt") SELECT "adminID", "createdAt", "id", "maintenanceMessage", "maintenanceMode", "siteDescription", "siteFavicon", "siteLogo", "siteName", "siteUrl", "updatedAt" FROM "SiteConfig";
DROP TABLE "SiteConfig";
ALTER TABLE "new_SiteConfig" RENAME TO "SiteConfig";
CREATE UNIQUE INDEX "SiteConfig_id_key" ON "SiteConfig"("id");
CREATE UNIQUE INDEX "SiteConfig_adminID_key" ON "SiteConfig"("adminID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
