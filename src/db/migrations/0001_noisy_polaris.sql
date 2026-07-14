CREATE TABLE "listing_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"url" text NOT NULL,
	"duration_seconds" integer NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "main_category" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "neighborhood" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "landmark" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "tiktok" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "youtube" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "twitter" text;--> statement-breakpoint
ALTER TABLE "listing_videos" ADD CONSTRAINT "listing_videos_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;