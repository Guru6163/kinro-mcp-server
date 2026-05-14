import { normalizeStateCode } from "./compliance_rules.js";

/** Hardcoded Kinro demo carrier panel (no external APIs). */
export interface MockCarrier {
  id: string;
  name: string;
  am_best: string;
  base_premium: number;
  states: string[];
  logo: string;
  /** Coverage lines this carrier is mocked to write in the demo. */
  supported_coverage: string[];
}

export const MOCK_CARRIERS: MockCarrier[] = [
  {
    id: "sf",
    name: "State Farm",
    am_best: "A++",
    base_premium: 120,
    states: ["CA", "TX", "FL", "NY", "IL"],
    logo: "https://logo.clearbit.com/statefarm.com",
    supported_coverage: ["homeowners", "auto", "renters"],
  },
  {
    id: "lm",
    name: "Lemonade",
    am_best: "A",
    base_premium: 85,
    states: ["CA", "TX", "NY", "NJ", "IL"],
    logo: "https://logo.clearbit.com/lemonade.com",
    supported_coverage: ["homeowners", "renters", "pet"],
  },
  {
    id: "al",
    name: "Allstate",
    am_best: "A+",
    base_premium: 135,
    states: ["CA", "TX", "FL", "NY", "OH"],
    logo: "https://logo.clearbit.com/allstate.com",
    supported_coverage: ["homeowners", "auto", "renters", "pet"],
  },
  {
    id: "pr",
    name: "Progressive",
    am_best: "A+",
    base_premium: 110,
    states: ["CA", "TX", "FL", "NY", "PA"],
    logo: "https://logo.clearbit.com/progressive.com",
    supported_coverage: ["auto", "renters", "pet"],
  },
  {
    id: "gk",
    name: "GEICO",
    am_best: "A++",
    base_premium: 95,
    states: ["CA", "TX", "FL", "NY", "VA"],
    logo: "https://logo.clearbit.com/geico.com",
    supported_coverage: ["auto", "renters"],
  },
  {
    id: "hp",
    name: "Hippo",
    am_best: "A-",
    base_premium: 100,
    states: ["CA", "TX", "AZ", "CO", "NV"],
    logo: "https://logo.clearbit.com/hippo.com",
    supported_coverage: ["homeowners", "renters"],
  },
  {
    id: "rt",
    name: "Root Insurance",
    am_best: "B+",
    base_premium: 78,
    states: ["TX", "OH", "IL", "PA", "AZ"],
    logo: "https://logo.clearbit.com/joinroot.com",
    supported_coverage: ["auto", "renters"],
  },
  {
    id: "op",
    name: "Openly",
    am_best: "A",
    base_premium: 115,
    states: ["CA", "FL", "TX", "GA", "NC"],
    logo: "https://logo.clearbit.com/openly.com",
    supported_coverage: ["homeowners"],
  },
  {
    id: "kn",
    name: "Kin Insurance",
    am_best: "A-",
    base_premium: 90,
    states: ["FL", "LA", "SC", "AL", "MS"],
    logo: "https://logo.clearbit.com/kininsurance.com",
    supported_coverage: ["homeowners", "renters"],
  },
  {
    id: "nw",
    name: "Nationwide",
    am_best: "A+",
    base_premium: 125,
    states: ["CA", "TX", "FL", "NY", "OH"],
    logo: "https://logo.clearbit.com/nationwide.com",
    supported_coverage: ["homeowners", "auto", "pet"],
  },
];

const NATIONAL_FALLBACK_NOTE =
  "Showing national carriers — state availability may vary";

export function filterMockCarriers(
  stateInput: string,
  coverageType: string,
): { matches: MockCarrier[]; usedFallback: boolean } {
  const code = normalizeStateCode(stateInput);
  const cov = coverageType.trim().toLowerCase();
  const matches = MOCK_CARRIERS.filter(
    (c) => c.states.includes(code) && c.supported_coverage.includes(cov),
  );
  if (matches.length > 0) {
    return { matches, usedFallback: false };
  }
  return { matches: MOCK_CARRIERS.slice(0, 3), usedFallback: true };
}

export function carriersInMarket(
  stateInput: string,
  coverageType: string,
): MockCarrier[] {
  return filterMockCarriers(stateInput, coverageType).matches;
}
