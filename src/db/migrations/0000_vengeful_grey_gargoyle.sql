CREATE TYPE "public"."coop_status" AS ENUM('active', 'inactive', 'empty');--> statement-breakpoint
CREATE TYPE "public"."feed_transaction_type" AS ENUM('purchase', 'usage');--> statement-breakpoint
CREATE TYPE "public"."population_type" AS ENUM('addition', 'reduction', 'mutation_in', 'mutation_out');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'worker');--> statement-breakpoint
CREATE TABLE "coop_populations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coop_id" uuid NOT NULL,
	"type" "population_type" NOT NULL,
	"count" integer NOT NULL,
	"date" date NOT NULL,
	"reason" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"capacity" integer NOT NULL,
	"chicken_count" integer DEFAULT 0 NOT NULL,
	"chicken_age_weeks" integer,
	"doc_entry_date" date,
	"status" "coop_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "egg_productions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coop_id" uuid NOT NULL,
	"production_date" date NOT NULL,
	"total_eggs" integer NOT NULL,
	"good_eggs" integer NOT NULL,
	"cracked_eggs" integer DEFAULT 0 NOT NULL,
	"broken_eggs" integer DEFAULT 0 NOT NULL,
	"small_eggs" integer DEFAULT 0 NOT NULL,
	"large_eggs" integer DEFAULT 0 NOT NULL,
	"weight_kg" numeric(8, 2),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_stocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"unit" varchar(20) DEFAULT 'kg' NOT NULL,
	"current_stock" numeric(10, 2) DEFAULT '0' NOT NULL,
	"minimum_stock" numeric(10, 2) DEFAULT '0' NOT NULL,
	"price_per_unit" numeric(12, 2),
	"supplier" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feed_stock_id" uuid NOT NULL,
	"type" "feed_transaction_type" NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"coop_id" uuid,
	"price_per_unit" numeric(12, 2),
	"supplier" varchar(255),
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coop_id" uuid NOT NULL,
	"record_date" date NOT NULL,
	"sick_count" integer DEFAULT 0 NOT NULL,
	"dead_count" integer DEFAULT 0 NOT NULL,
	"treatment" varchar(255),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'worker' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vaccination_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coop_id" uuid NOT NULL,
	"vaccine_name" varchar(100) NOT NULL,
	"scheduled_date" date NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coop_populations" ADD CONSTRAINT "coop_populations_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "egg_productions" ADD CONSTRAINT "egg_productions_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_transactions" ADD CONSTRAINT "feed_transactions_feed_stock_id_feed_stocks_id_fk" FOREIGN KEY ("feed_stock_id") REFERENCES "public"."feed_stocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_transactions" ADD CONSTRAINT "feed_transactions_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaccination_schedules" ADD CONSTRAINT "vaccination_schedules_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE cascade ON UPDATE no action;