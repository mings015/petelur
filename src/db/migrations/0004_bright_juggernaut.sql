CREATE TYPE "public"."report_format" AS ENUM('xlsx', 'pdf');--> statement-breakpoint
CREATE TYPE "public"."report_frequency" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('production', 'feed', 'health', 'vaccination', 'population');--> statement-breakpoint
CREATE TABLE "report_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "report_type" NOT NULL,
	"frequency" "report_frequency" NOT NULL,
	"format" "report_format" DEFAULT 'xlsx' NOT NULL,
	"coop_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_run" timestamp with time zone,
	"next_run" timestamp with time zone NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "report_type" NOT NULL,
	"format" "report_format" NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"coop_id" uuid,
	"storage_path" text,
	"generated_at" timestamp with time zone,
	"generated_by" uuid NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_schedules" ADD CONSTRAINT "report_schedules_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_coop_id_coops_id_fk" FOREIGN KEY ("coop_id") REFERENCES "public"."coops"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_report_schedules_next_run" ON "report_schedules" USING btree ("next_run");--> statement-breakpoint
CREATE INDEX "idx_reports_generated_by" ON "reports" USING btree ("generated_by");--> statement-breakpoint
CREATE INDEX "idx_reports_generated_at" ON "reports" USING btree ("generated_at");--> statement-breakpoint
CREATE INDEX "idx_reports_type" ON "reports" USING btree ("type");