/*
  Warnings:

  - Added the required column `lang` to the `CollabSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CollabSession" ADD COLUMN     "lang" TEXT NOT NULL;
