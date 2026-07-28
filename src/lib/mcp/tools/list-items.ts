import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_items",
  title: "List inventory items",
  description:
    "List the signed-in user's inventory items with rate, cost and current stock.",
  inputSchema: {
    search: z.string().trim().optional().describe("Filter by item name."),
    low_stock_only: z
      .boolean()
      .optional()
      .describe("Only return items at or below their reorder level."),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, low_stock_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("items")
      .select("id,name,unit,rate,cost,stock,reorder_level,vat_percentage")
      .order("name")
      .limit(limit ?? 100);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data, error } = await query;
    if (error) return fail(error.message);
    const rows = low_stock_only
      ? (data ?? []).filter(
          (i) =>
            i.reorder_level != null && Number(i.stock) <= Number(i.reorder_level),
        )
      : (data ?? []);
    return ok(rows);
  },
});