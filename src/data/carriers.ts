import type { Carrier } from "../types.js";
import { normalizeStateCode } from "./state_code.js";

export const CARRIERS: Carrier[] = [
  {
    id: "sf-001",
    name: "State Farm",
    am_best_rating: "A+",
    supported_states: ["CA", "TX", "FL", "IL", "NY", "PA", "OH", "GA", "NC", "MI"],
    supported_coverage: ["homeowners", "auto", "renters"],
    base_premium: 118,
  },
  {
    id: "al-002",
    name: "Allstate",
    am_best_rating: "A+",
    supported_states: ["CA", "TX", "FL", "AZ", "WA", "CO", "NJ", "VA", "TN", "MO"],
    supported_coverage: ["homeowners", "auto", "renters", "pet"],
    base_premium: 126,
  },
  {
    id: "pr-003",
    name: "Progressive",
    am_best_rating: "A+",
    supported_states: ["TX", "FL", "OH", "PA", "IN", "WI", "MN", "OR", "SC", "KY"],
    supported_coverage: ["auto", "renters", "pet"],
    base_premium: 98,
  },
  {
    id: "lm-004",
    name: "Liberty Mutual",
    am_best_rating: "A",
    supported_states: ["CA", "MA", "NH", "CT", "WA", "OR", "UT", "NV", "MD", "DC"],
    supported_coverage: ["homeowners", "auto", "renters"],
    base_premium: 132,
  },
  {
    id: "fm-005",
    name: "Farmers Insurance",
    am_best_rating: "A",
    supported_states: ["CA", "TX", "AZ", "OK", "KS", "NE", "IA", "AR", "LA", "NM"],
    supported_coverage: ["homeowners", "auto", "renters", "pet"],
    base_premium: 121,
  },
  {
    id: "us-006",
    name: "USAA",
    am_best_rating: "A+",
    supported_states: ["TX", "FL", "CA", "VA", "CO", "WA", "GA", "NC", "AZ", "NV"],
    supported_coverage: ["homeowners", "auto", "renters"],
    base_premium: 105,
  },
  {
    id: "tv-007",
    name: "Travelers",
    am_best_rating: "A+",
    supported_states: ["NY", "CT", "NJ", "PA", "MA", "IL", "MN", "WI", "MI", "IN"],
    supported_coverage: ["homeowners", "auto", "renters"],
    base_premium: 129,
  },
  {
    id: "nw-008",
    name: "Nationwide",
    am_best_rating: "A+",
    supported_states: ["OH", "PA", "NC", "SC", "TN", "KY", "WV", "VA", "MD", "DE"],
    supported_coverage: ["homeowners", "auto", "pet"],
    base_premium: 115,
  },
  {
    id: "cb-009",
    name: "Chubb",
    am_best_rating: "A+",
    supported_states: ["NY", "CA", "FL", "TX", "IL", "NJ", "CT", "MA", "PA", "GA"],
    supported_coverage: ["homeowners", "auto", "renters"],
    base_premium: 168,
  },
  {
    id: "lm-010",
    name: "Lemonade",
    am_best_rating: "A-",
    supported_states: ["NY", "CA", "TX", "IL", "NJ", "PA", "OH", "GA", "CO", "TN"],
    supported_coverage: ["homeowners", "renters", "pet"],
    base_premium: 88,
  },
  {
    id: "am-011",
    name: "American Family",
    am_best_rating: "A",
    supported_states: ["WI", "MN", "IA", "MO", "NE", "KS", "SD", "ND", "IN", "OH"],
    supported_coverage: ["homeowners", "auto", "renters"],
    base_premium: 112,
  },
];

export function carriersInMarket(
  stateInput: string,
  coverageType: string,
): Carrier[] {
  const code = normalizeStateCode(stateInput);
  const cov = coverageType.trim().toLowerCase();
  return CARRIERS.filter(
    (c) =>
      c.supported_states.includes(code) && c.supported_coverage.includes(cov),
  );
}

