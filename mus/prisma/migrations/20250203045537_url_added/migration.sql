/*
  Warnings:

  - Added the required column `extractedId` to the `stream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `stream` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stream" ADD COLUMN     "extractedId" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
