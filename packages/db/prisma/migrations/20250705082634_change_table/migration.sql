/*
  Warnings:

  - The values [Pending] on the enum `p2p_transaction_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "p2p_transaction_status_new" AS ENUM ('Success', 'Failed', 'Processing');
ALTER TABLE "p2ptransfer" ALTER COLUMN "status" TYPE "p2p_transaction_status_new" USING ("status"::text::"p2p_transaction_status_new");
ALTER TYPE "p2p_transaction_status" RENAME TO "p2p_transaction_status_old";
ALTER TYPE "p2p_transaction_status_new" RENAME TO "p2p_transaction_status";
DROP TYPE "p2p_transaction_status_old";
COMMIT;
