-- AlterTable
ALTER TABLE "psychomot"."BilanType" ADD COLUMN     "job" "psychomot"."Job"[] DEFAULT ARRAY[]::"psychomot"."Job"[];
