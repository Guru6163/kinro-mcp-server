import { z } from "zod";
import { filterMockCarriers, MOCK_CARRIERS } from "../data/carriers.js";

export const listCarriersInputSchema = z.object({
  state: z.string(),
  coverage_type: z.string(),
});

export interface ListedCarrierRow {
  id: string;
  name: string;
  am_best: string;
  base_premium: number;
  states: string[];
  logo: string;
}

export interface ListCarriersResponse {
  carriers: ListedCarrierRow[];
  note: string | null;
}

const FALLBACK_NOTE =
  "Showing national carriers — state availability may vary";

export function listCarriersForMarket(
  state: string,
  coverageType: string,
): ListCarriersResponse {
  const { matches, usedFallback } = filterMockCarriers(state, coverageType);
  const source = usedFallback ? MOCK_CARRIERS.slice(0, 3) : matches;
  const carriers: ListedCarrierRow[] = source.map((c) => ({
    id: c.id,
    name: c.name,
    am_best: c.am_best,
    base_premium: c.base_premium,
    states: c.states,
    logo: c.logo,
  }));
  return {
    carriers,
    note: usedFallback ? FALLBACK_NOTE : null,
  };
}

export const listCarriersTool = {
  name: "list_carriers" as const,
  description:
    "List demo carriers for a state and coverage type (mock directory; national fallback when no in-state match).",
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
  const payload = listCarriersForMarket(
    parsed.data.state,
    parsed.data.coverage_type,
  );
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload) }],
  };
}
