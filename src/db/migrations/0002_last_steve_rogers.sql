CREATE INDEX "idx_coop_populations_coop_id" ON "coop_populations" USING btree ("coop_id");--> statement-breakpoint
CREATE INDEX "idx_coop_populations_date" ON "coop_populations" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_coops_status" ON "coops" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_egg_productions_coop_id" ON "egg_productions" USING btree ("coop_id");--> statement-breakpoint
CREATE INDEX "idx_egg_productions_date" ON "egg_productions" USING btree ("production_date");--> statement-breakpoint
CREATE INDEX "idx_egg_sales_date" ON "egg_sales" USING btree ("sale_date");--> statement-breakpoint
CREATE INDEX "idx_egg_sales_customer_id" ON "egg_sales" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_egg_sales_category_id" ON "egg_sales" USING btree ("egg_category_id");--> statement-breakpoint
CREATE INDEX "idx_expenses_date" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "idx_expenses_category_id" ON "expenses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_feed_transactions_stock_id" ON "feed_transactions" USING btree ("feed_stock_id");--> statement-breakpoint
CREATE INDEX "idx_feed_transactions_date" ON "feed_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_health_records_coop_id" ON "health_records" USING btree ("coop_id");--> statement-breakpoint
CREATE INDEX "idx_health_records_date" ON "health_records" USING btree ("record_date");--> statement-breakpoint
CREATE INDEX "idx_incomes_date" ON "incomes" USING btree ("income_date");--> statement-breakpoint
CREATE INDEX "idx_incomes_source_id" ON "incomes" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_vaccination_coop_id" ON "vaccination_schedules" USING btree ("coop_id");--> statement-breakpoint
CREATE INDEX "idx_vaccination_scheduled_date" ON "vaccination_schedules" USING btree ("scheduled_date");