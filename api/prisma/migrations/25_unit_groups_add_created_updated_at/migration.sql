/*
  Warnings:

  - Added the required column `updated_at` to the `unit_group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `unit_group_ami_levels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "unit_group" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE "unit_group_ami_levels" ADD COLUMN     "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(6) NOT NULL;
