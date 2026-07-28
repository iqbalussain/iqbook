import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listClientsTool from "./tools/list-clients";
import listInvoicesTool from "./tools/list-invoices";
import listItemsTool from "./tools/list-items";
import listVouchersTool from "./tools/list-vouchers";
import financialSummaryTool from "./tools/financial-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "iqbook-mcp",
  title: "IQBook",
  version: "0.1.0",
  instructions:
    "Read-only accounting tools for IQBook. Use `list_clients`, `list_invoices`, `list_items` and `list_vouchers` to inspect the signed-in user's books, and `financial_summary` for totals of sales, purchases, payments and outstanding receivables.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listClientsTool,
    listInvoicesTool,
    listItemsTool,
    listVouchersTool,
    financialSummaryTool,
  ],
});