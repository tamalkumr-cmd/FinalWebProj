/*
  Warnings:

  - You are about to drop the column `description` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the `Spec` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `airline` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrival` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departure` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seats` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passengers` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Spec" DROP CONSTRAINT "Spec_listingId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "description",
DROP COLUMN "imageUrl",
DROP COLUMN "title",
DROP COLUMN "videoUrl",
ADD COLUMN     "aircraftId" TEXT,
ADD COLUMN     "aircraftModel" TEXT NOT NULL DEFAULT 'B737-MAX',
ADD COLUMN     "airline" TEXT NOT NULL,
ADD COLUMN     "arrival" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cabinClass" TEXT,
ADD COLUMN     "departure" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "destLat" DOUBLE PRECISION,
ADD COLUMN     "destLng" DOUBLE PRECISION,
ADD COLUMN     "destination" TEXT NOT NULL,
ADD COLUMN     "engineType" TEXT NOT NULL DEFAULT 'CFM LEAP-1B',
ADD COLUMN     "fuelLoad" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "manufacturer" TEXT NOT NULL DEFAULT 'BOEING',
ADD COLUMN     "operatorLogo" TEXT,
ADD COLUMN     "pilotBio" TEXT,
ADD COLUMN     "pilotName" TEXT NOT NULL DEFAULT 'Capt. Unknown',
ADD COLUMN     "pilotPhoto" TEXT,
ADD COLUMN     "seats" INTEGER NOT NULL,
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "sourceLat" DOUBLE PRECISION,
ADD COLUMN     "sourceLng" DOUBLE PRECISION,
ADD COLUMN     "vesselType" TEXT NOT NULL DEFAULT 'PASSENGER',
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "passengers" INTEGER NOT NULL,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'PASSENGER';

-- DropTable
DROP TABLE "Spec";

-- CreateTable
CREATE TABLE "Aircraft" (
    "id" TEXT NOT NULL,
    "tailNumber" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL DEFAULT 'BOEING',
    "model" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,

    CONSTRAINT "Aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ECONOMY',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "aircraftId" TEXT NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,
    "senderId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FlightCrew" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Aircraft_tailNumber_key" ON "Aircraft"("tailNumber");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_idx" ON "ListingImage"("listingId");

-- CreateIndex
CREATE INDEX "Message_listingId_idx" ON "Message"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "_FlightCrew_AB_unique" ON "_FlightCrew"("A", "B");

-- CreateIndex
CREATE INDEX "_FlightCrew_B_index" ON "_FlightCrew"("B");

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "Aircraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlightCrew" ADD CONSTRAINT "_FlightCrew_A_fkey" FOREIGN KEY ("A") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FlightCrew" ADD CONSTRAINT "_FlightCrew_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
