import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

const PRICE_MAP: Record<string, string> = {
  analyst: process.env.STRIPE_PRICE_ANALYST!,
  veractor: process.env.STRIPE_PRICE_VERACTOR!,
  donation: process.env.STRIPE_PRICE_DONATION!,
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { type, amount } = body as { type: string; amount?: string };

    if (!type || !PRICE_MAP[type]) {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    const isDonation = type === "donation";

    const lineItem = isDonation && amount && !isNaN(parseFloat(amount))
      ? {
          price_data: {
            currency: "eur",
            product_data: { name: "Apoio ao Veractum" },
            unit_amount: Math.round(parseFloat(amount) * 100),
          },
          quantity: 1,
        }
      : {
          price: PRICE_MAP[type],
          quantity: 1,
        };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: isDonation ? "payment" : "subscription",
      line_items: [lineItem],
      success_url: `${process.env.NEXTAUTH_URL}/pricing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?cancelled=true`,
      customer_email: session.user.email ?? undefined,
      metadata: {
        userId: session.user.id,
        tier: isDonation ? "" : type,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
