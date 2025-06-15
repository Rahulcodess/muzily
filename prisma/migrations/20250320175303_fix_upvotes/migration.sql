/*
  Warnings:

  - You are about to drop the column `downvotes` on the `stream` table. All the data in the column will be lost.
  - You are about to drop the column `haveupvoted` on the `stream` table. All the data in the column will be lost.
  - You are about to drop the column `upvotes` on the `stream` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stream" DROP COLUMN "downvotes",
DROP COLUMN "haveupvoted",
DROP COLUMN "upvotes";
