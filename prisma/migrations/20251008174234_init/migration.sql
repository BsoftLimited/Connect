-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "ntype" TEXT NOT NULL DEFAULT 'info',
    "receiverID" TEXT NOT NULL,
    CONSTRAINT "Notification_receiverID_fkey" FOREIGN KEY ("receiverID") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_id_key" ON "Notification"("id");
