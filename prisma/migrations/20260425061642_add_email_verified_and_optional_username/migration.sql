-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ALTER COLUMN "username" DROP NOT NULL;
