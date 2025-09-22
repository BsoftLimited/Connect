-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT 'Connect',
    "siteLogo" TEXT NOT NULL DEFAULT '/logo.svg',
    "siteFavicon" TEXT NOT NULL DEFAULT '/favicon.ico',
    "siteUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000',
    "siteDescription" TEXT NOT NULL DEFAULT 'Connect - The ultimate platform for managing your applications and services.',
    "adminEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'The site is under maintenance. Please check back later.',
    "allowQuestSignup" BOOLEAN NOT NULL DEFAULT true,
    "allowQuestDownload" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_SiteConfig" ("adminEmail", "allowQuestSignup", "createdAt", "id", "maintenanceMessage", "maintenanceMode", "siteDescription", "siteFavicon", "siteLogo", "siteName", "siteUrl", "updatedAt") SELECT "adminEmail", "allowQuestSignup", "createdAt", "id", "maintenanceMessage", "maintenanceMode", "siteDescription", "siteFavicon", "siteLogo", "siteName", "siteUrl", "updatedAt" FROM "SiteConfig";
DROP TABLE "SiteConfig";
ALTER TABLE "new_SiteConfig" RENAME TO "SiteConfig";
CREATE UNIQUE INDEX "SiteConfig_id_key" ON "SiteConfig"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
