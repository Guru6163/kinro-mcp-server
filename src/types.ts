/** Rich mock quote returned by `get_quote` (demo only, no live rating). */
export interface Quote {
  quote_id: string;
  carrier_id: string;
  carrier_name: string;
  am_best_rating: string;
  monthly_premium: number;
  estimated_annual: number;
  deductible: 500 | 1000 | 2500;
  coverage_limit: 200_000 | 300_000 | 500_000;
  carrier_logo_url: string;
  valid_until: string;
}

/** Legacy-style row; primary mock directory uses `MockCarrier` in `data/carriers.ts`. */
export interface Carrier {
  id: string;
  name: string;
  am_best_rating: string;
  supported_states: string[];
  supported_coverage: string[];
  base_premium: number;
}

export interface ComplianceResult {
  compliant: boolean;
  issues: string[];
  /** 100 = fully compliant; minus 15 per matched banned phrase (floor 0). */
  compliance_score: number;
}

export interface BuyerScore {
  score: number;
  tier: "hot" | "warm" | "cold";
  reason: string;
  recommended_coverage_type: string;
  next_step: "book_demo" | "self_serve" | "needs_review";
  estimated_annual_savings: number;
}

export interface PolicyExplanation {
  policy_id: string;
  buyer_question: string;
  template_index: 0 | 1 | 2;
  agent_narrative: string;
  disclaimer: string;
}
