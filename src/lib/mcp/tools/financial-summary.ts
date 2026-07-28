import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fail, ok, supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "financial_summary",
  title: "Financial summary",
  description:
    "Summarise the signed-in user's sales, purchases, payments received and outstanding receivables.",
  inputSchema: {
    from_date: z.string().optional().describe("Start date (YYYY-MM-DD)."),
    to_date: z.string().optional().describe("End date (YYYY-MM-DD)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from_date, to_date }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);

    const range = <T>(q: T): T => {
      let query = q as unknown as {
        gte: (c: string, v: string) => unknown;
        lte: (c: string, v: string) => unknown;
      };
      let out: unknown = query;
      if (from_date) out = (out as typeof query).gte("created_at", from_date);
      if (to_date) out = (out as typeof query).lte("created_at", to_date);
      return out as T;
    };

    const [sales, purchases, payments] = await Promise.all([
      range(supabase.from("invoices").select("net_total,status")),
      range(supabase.from("purchase_invoices").select("net_total,status")),
      range(supabase.from("payments").select("amount,invoice_type")),
    ]);

    const err = sales.error || purchases.error || payments.error;
    if (err) return fail(err.message);

    const sum = (rows: { [k: string]: unknown }[], key: string) =>
      rows.reduce((t, r) => t + Number(r[key] ?? 0), 0);

    const salesRows = sales.data ?? [];
    const paymentRows = payments.data ?? [];

    return ok({
      period: { from: from_date ?? null, to: to_date ?? null },
      sales_invoice_count: salesRows.length,
      total_sales: sum(salesRows, "net_total"),
      total_purchases: sum(purchases.data ?? [], "net_total"),
      payments_received: sum(
        paymentRows.filter((p) => p.invoice_type === "sales"),
        "amount",
      ),
      payments_made: sum(
        paymentRows.filter((p) => p.invoice_type === "purchase"),
        "amount",
      ),
      unpaid_sales_value: sum(
        salesRows.filter((r) => r.status !== "paid" && r.status !== "cancelled"),
        "net_total",
      ),
    });
  },
});