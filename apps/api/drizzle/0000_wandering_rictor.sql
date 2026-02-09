CREATE TABLE "collaboration_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"drawing_id" integer NOT NULL,
	"created_by" integer NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drawings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"preset" text DEFAULT 'default',
	"is_permanent" boolean DEFAULT false,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenes" (
	"id" serial PRIMARY KEY NOT NULL,
	"drawing_id" integer NOT NULL,
	"name" text NOT NULL,
	"data" json NOT NULL,
	"preview" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "collaboration_rooms" ADD CONSTRAINT "collaboration_rooms_drawing_id_drawings_id_fk" FOREIGN KEY ("drawing_id") REFERENCES "public"."drawings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_rooms" ADD CONSTRAINT "collaboration_rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drawings" ADD CONSTRAINT "drawings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_drawing_id_drawings_id_fk" FOREIGN KEY ("drawing_id") REFERENCES "public"."drawings"("id") ON DELETE cascade ON UPDATE no action;