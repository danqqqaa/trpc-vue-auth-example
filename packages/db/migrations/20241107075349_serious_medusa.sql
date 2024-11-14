ALTER TABLE "userCredentials" ALTER COLUMN "payload" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "userCredentials" ALTER COLUMN "payload" SET NOT NULL;