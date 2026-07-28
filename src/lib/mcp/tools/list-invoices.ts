import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_invoices",
  title: "List sales invoices",
  description:
    "List the signed-in user's sales invoices with number, client, totals, status and due date.",
  inputSchema: {
    status: z
      .enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"])
      .optional()
      .describe("Filter by invoice status."),
    client_id: z.string().uuid().optional().describe("Filter by client id."),
    limit: z.number().int().min(1).max(200).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, client_id, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    let query = supabaseForUser(ctx)
      .from("invoices")
      .select(
        "id,number,client_id,status,net_total,subtotal,vat_total,due_date,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) query = query.eq("status", status);
    if (client_id) query = query.eq("client_id", client_id);
    const { data, error } = await query;
    return error ? fail(error.message) : ok(data ?? []);
  },
});