import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_clients",
  title: "List clients",
  description:
    "List the signed-in user's customers and vendors, optionally filtered by name or type.",
  inputSchema: {
    search: z.string().trim().optional().describe("Filter by client name."),
    type: z
      .enum(["customer", "vendor", "both"])
      .optional()
      .describe("Filter by party type."),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search, type, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (search) query = query.ilike("name", `%${search}%`);
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    return error ? fail(error.message) : ok(data ?? []);
  },
});