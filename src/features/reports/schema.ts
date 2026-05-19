import { z } from "zod";

export const reportFilterSchema = z.object({
  type: z.enum(["production", "feed", "health", "vaccination", "population"]),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coopId: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
});

export const createScheduleSchema = z.object({
  type: z.enum(["production", "feed", "health", "vaccination", "population"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  format: z.enum(["xlsx", "pdf"]).default("xlsx"),
  coopId: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
