import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPrismaClient } from "@/lib/prisma";
import type Stripe from "stripe";

const TIER_MAP: Record<string, string> = {
  analyst: "analyst",
  veractor: "veractor",
};

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient();
  if (!prisma) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;

      if (userId && tier && TIER_MAP[tier]) {
        await prisma.user.update({
          where: { id: userId },
          data: { tier: TIER_MAP[tier] },
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      // Resolve userId from subscription metadata if stored, otherwise fall back to customer lookup
      const userId = (subscription.metadata as Record<string, string> | undefined)?.userId;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { tier: "free" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook] Handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}
