ALTER TABLE "userCredentials" ALTER COLUMN "payload" SET DEFAULT '$2a$10$fLAKJ64ygprhUjllkH7UTuUvomWyfqFu/AevHyDuPM1ItCjsKZA4i';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "default_pass" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "userCredentials" DROP COLUMN IF EXISTS "default_pass";