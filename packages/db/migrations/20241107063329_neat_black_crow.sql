DO $$ BEGIN
 CREATE TYPE "public"."type" AS ENUM('password');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userCredentials" (
	"user_id" integer NOT NULL,
	"type" "type" DEFAULT 'password',
	"payload" varchar(255) DEFAULT '$2a$10$mfXS5.jt5oiABTCIuf9TxuOL.TL49p5gm/7R7GYCZGhdd/Ox2ZCwC',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userCredentials" ADD CONSTRAINT "userCredentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_login_unique" UNIQUE("login");