export interface Quote {
  carrier_id: string;
  carrier_name: string;
  am_best_rating: string;
  monthly_premium: number;
  coverage_limit: number;
}

export interface Carrier {
  id: string;
  name: string;
  am_best_rating: "A+" | "A" | "A-" | "B+";
  supported_states: string[];
  supported_coverage: string[];
  base_premium: number;
}

export interface ComplianceResult {
  compliant: boolean;
  issues: string[];
}

export interface BuyerScore {
  score: number;
  tier: "hot" | "warm" | "cold";
  reason: string;
}

export interface PolicyExplanation {
  policy_id: string;
  buyer_question: string;
  product_summary: string;
  coverage_highlights: string[];
  buyer_answer: string;
  disclaimer: string;
}
