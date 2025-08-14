-- AlterTable
ALTER TABLE "psychomot"."Section" ADD COLUMN     "job" "psychomot"."Job"[] DEFAULT ARRAY[]::"psychomot"."Job"[];
