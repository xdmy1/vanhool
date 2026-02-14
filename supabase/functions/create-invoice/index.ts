import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const REFRENS_BASE_URL = "https://api.refrens.com";
const REFRENS_APP_ID = Deno.env.get("REFRENS_APP_ID") || "inter-bus-parts-ck2sd3-TPIXz";
const REFRENS_APP_SECRET = Deno.env.get("REFRENS_APP_SECRET") || "JnR4eQ0jeKsgWKfPbUcu8NGH";
const REFRENS_BUSINESS_SLUG = "inter-bus-parts-ck2sd3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${REFRENS_BASE_URL}/authentication`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      strategy: "app-secret",
      appId: REFRENS_APP_ID,
      appSecret: REFRENS_APP_SECRET,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Refrens auth failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.accessToken;
}

interface InvoiceRequest {
  action: "invoice" | "confirmation";
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency?: string;
  countryCode?: string;
}

async function createRefrensDocument(token: string, req: InvoiceRequest, title: string) {
  const invoiceItems = req.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    rate: item.price,
    amount: item.price * item.quantity,
  }));

  // Add shipping as a line item if > 0
  if (req.shipping > 0) {
    invoiceItems.push({
      name: "Shipping / Livrare",
      quantity: 1,
      rate: req.shipping,
      amount: req.shipping,
    });
  }

  // Add discount as a negative line item if > 0
  if (req.discount > 0) {
    invoiceItems.push({
      name: "Discount / Reducere",
      quantity: 1,
      rate: -req.discount,
      amount: -req.discount,
    });
  }

  // Map phone country code to ISO country code for billedTo
  const countryMap: Record<string, string> = {
    "+373": "MD", "+40": "RO", "+7": "RU",
    "+44": "GB", "+49": "DE", "+33": "FR",
    "+39": "IT", "+34": "ES",
  };
  const country = countryMap[req.countryCode || "+373"] || "MD";

  const invoicePayload = {
    invoiceTitle: title,
    billedTo: {
      name: req.customerName,
      email: req.customerEmail,
      country: country,
    },
    items: invoiceItems,
    currency: req.currency || "EUR",
    email: {
      to: {
        name: req.customerName,
        email: req.customerEmail,
      },
    },
  };

  const res = await fetch(
    `${REFRENS_BASE_URL}/businesses/${REFRENS_BUSINESS_SLUG}/invoices`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(invoicePayload),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Refrens document creation failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: InvoiceRequest = await req.json();

    if (body.action === "invoice") {
      // Bank transfer: create and email a Proforma Invoice
      const token = await getAccessToken();
      const invoice = await createRefrensDocument(token, body, "Proforma Invoice");

      return new Response(
        JSON.stringify({
          success: true,
          invoiceId: invoice._id || invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          invoiceUrl: invoice.share?.link || null,
          pdfUrl: invoice.share?.pdf || null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (body.action === "confirmation") {
      // Cash on delivery: create and email an Order Confirmation
      const token = await getAccessToken();
      const confirmation = await createRefrensDocument(token, body, "Order Confirmation");

      return new Response(
        JSON.stringify({
          success: true,
          invoiceId: confirmation._id || confirmation.id,
          invoiceNumber: confirmation.invoiceNumber,
          invoiceUrl: confirmation.share?.link || null,
          pdfUrl: confirmation.share?.pdf || null,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
