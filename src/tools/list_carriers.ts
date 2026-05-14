import { z } from "zod";
import { carriersInMarket } from "../data/carriers.js";

export const listCarriersInputSchema = z.object({
  state: z.string(),
  coverage_type: z.string(),
});

export interface ListedCarrierRow {
  id: string;
  name: string;
  am_best_rating: string;
  avg_premium: number;
  available: boolean;
}

export function listCarriersForMarket(
  state: string,
  coverageType: string,
): ListedCarrierRow[] {
  return carriersInMarket(state, coverageType).map((c) => ({
    id: c.id,
    name: c.name,
    am_best_rating: c.am_best_rating,
    avg_premium: c.base_premium,
    available: true,
  }));
}

export const listCarriersTool = {
  name: "list_carriers" as const,
  description:
    "List Kinro carriers that support a given state and coverage type (mock directory).",
  inputSchema: {
    type: "object" as const,
    properties: {
      state: { type: "string", description: "Two-letter state code." },
      coverage_type: {
        type: "string",
        description: "Line of business (e.g. homeowners, auto).",
      },
    },
    required: ["state", "coverage_type"],
  },
};

export function handleListCarriers(raw: unknown) {
  const parsed = listCarriersInputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid arguments: ${JSON.stringify(parsed.error.flatten())}`,
    );
  }
  const rows = listCarriersForMarket(
    parsed.data.state,
    parsed.data.coverage_type,
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(rows) }],
  };
}
