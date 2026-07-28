import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_vouchers",
  title: "List vouchers",
  description:
    "List the signed-in user's accounting vouchers (expense, contra, loan, journal) with amounts and narration.",
  inputSchema: {
    type: z
      .enum(["contra", "expense", "loan_given", "loan_received", "journal"])
      .optional()
      .describe("Filter by voucher type."),
    from_date: z.string().optional().describe("Earliest voucher date (YYYY-MM-DD)."),
    to_date: z.string().optional().describe("Latest voucher date (YYYY-MM-DD)."),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ type, from_date, to_date, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("vouchers")
      .select("id,number,type,date,party_name,amount,narration,method,reference")
      .order("date", { ascending: false })
      .limit(limit ?? 50);
    if (type) query = query.eq("type", type);
    if (from_date) query = query.gte("date", from_date);
    if (to_date) query = query.lte("date", to_date);
    const { data, error } = await query;
    return error ? fail(error.message) : ok(data ?? []);
  },
});