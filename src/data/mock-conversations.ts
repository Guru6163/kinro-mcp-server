export type DemoScenario =
  | "homeowner"
  | "renter"
  | "auto"
  | "first_time_buyer";

export type DemoTurn = { role: "user" | "agent"; message: string };

export const DEMO_CONVERSATIONS: Record<DemoScenario, DemoTurn[]> = {
  homeowner: [
    {
      role: "user",
      message:
        "We’re closing on a Craftsman in Oakland next month and the lender wants proof of HO-3 before funding.",
    },
    {
      role: "agent",
      message:
        "Congratulations on the purchase. I’ll pull replacement-cost estimates for the dwelling, other structures, and personal property, then we’ll line up liability limits that match your comfort zone.",
    },
    {
      role: "user",
      message:
        "The inspector flagged an older roof—will that hurt us on wind/hail?",
    },
    {
      role: "agent",
      message:
        "Carriers will ask for age, material, and maintenance history. We’ll document recent repairs and, if needed, quote a matching deductible so you’re not surprised at claim time.",
    },
    {
      role: "user",
      message: "Can you show me three carriers side-by-side with annual totals?",
    },
    {
      role: "agent",
      message:
        "Absolutely—here are three HO-3 quotes with different deductible options. Once you pick a carrier, I’ll email the binder to your loan officer same day.",
    },
  ],
  renter: [
    {
      role: "user",
      message:
        "I signed a lease in Austin—landlord requires $300k liability and replacement-cost for my electronics.",
    },
    {
      role: "agent",
      message:
        "Renters HO-4 is quick to bind. I’ll confirm scheduled limits for cameras and laptops, then stack umbrella if you want extra liability beyond the lease minimum.",
    },
    {
      role: "user",
      message: "Do roommates need separate policies?",
    },
    {
      role: "agent",
      message:
        "Usually each unrelated adult should carry their own policy or be named insured. I’ll read your lease rider and map the cleanest setup so everyone stays compliant.",
    },
    {
      role: "user",
      message: "What’s the fastest you can email proof to my landlord?",
    },
    {
      role: "agent",
      message:
        "Once we bind, the dec page issues instantly—expect PDF proof in your inbox within minutes, plus a plain-language summary you can forward to property management.",
    },
  ],
  auto: [
    {
      role: "user",
      message:
        "I’m comparing full coverage on a 2021 RAV4 Hybrid—100/300 liability, $500 comp/collision deductibles.",
    },
    {
      role: "agent",
      message:
        "Great baseline. I’ll verify garaging ZIP, annual mileage, and any rideshare use, then quote UM/UIM matching your liability limits so you’re not underinsured in a hit-and-run.",
    },
    {
      role: "user",
      message: "I occasionally drive for a delivery app on weekends.",
    },
    {
      role: "agent",
      message:
        "Thanks for flagging that—personal auto excludes most gig platforms unless endorsed. I’ll price the rideshare/hire endorsement where available so you’re covered while online.",
    },
    {
      role: "user",
      message: "If I bundle renters at the same address, what breaks on premium?",
    },
    {
      role: "agent",
      message:
        "Bundling typically trims 8–15% on auto while keeping deductibles aligned. I’ll show the combined annual outlay and highlight any payment-plan options.",
    },
  ],
  first_time_buyer: [
    {
      role: "user",
      message:
        "This is our first home—we’re overwhelmed by escrow, inspections, and insurance jargon.",
    },
    {
      role: "agent",
      message:
        "Totally normal. Think of homeowners insurance in three buckets: rebuild the house, protect your savings from lawsuits, and replace your stuff after a covered loss. We’ll walk each bucket slowly.",
    },
    {
      role: "user",
      message: "What’s the difference between market value and replacement cost?",
    },
    {
      role: "agent",
      message:
        "Market value includes land and curb appeal; insurance focuses on rebuilding sticks-and-bricks. We’ll base dwelling coverage on reconstruction estimates, not Zillow zestimates.",
    },
    {
      role: "user",
      message: "Can we start with a ballpark before we send the inspection report?",
    },
    {
      role: "agent",
      message:
        "Yes—I'll run a soft quote with educated guesses, then tighten numbers once we have roof, electrical, and square footage confirmed. Nothing binds until you say go.",
    },
  ],
};

/** Fifth scripted arc (post-quote / bind) — same file as the four `get_demo_conversation` scenarios. */
export const POST_BIND_DEMO_FLOW: DemoTurn[] = [
  {
    role: "user",
    message:
      "We picked Carrier B from your comparison—what happens between now and effective date?",
  },
  {
    role: "agent",
    message:
      "I’ll collect mortgagee clause wording, finalize deductibles, and run a last compliance scan on any marketing language you plan to reuse in drip emails.",
  },
  {
    role: "user",
    message: "Do we pay upfront or can we escrow with the loan?",
  },
  {
    role: "agent",
    message:
      "Closing table can fund the first year via escrow; I’ll sync with your title company on the wire instructions and send the invoice breakdown so cash-to-close stays predictable.",
  },
  {
    role: "user",
    message: "Please send the policy packet to both of us and CC our attorney.",
  },
  {
    role: "agent",
    message:
      "Done—policy jacket, endorsements, and paid-in-full receipt are queued. After bind I’ll set a 30-day check-in for photos of jewelry scheduled items and smoke detector receipts.",
  },
];
