/**
 * Smoke-test Kinro tool handlers without Claude Desktop.
 *
 * Imports compiled handlers from `build/` (run `npm run build` first, or use
 * `npm run test:tools` which builds then runs this file with ts-node).
 */
import { handleCheckCompliance } from "../build/tools/check_compliance.js";
import { handleExplainPolicy } from "../build/tools/explain_policy.js";
import { handleGetQuote } from "../build/tools/get_quote.js";
import { handleListCarriers } from "../build/tools/list_carriers.js";
import { handleQualifyBuyer } from "../build/tools/qualify_buyer.js";

function printSection(title: string, payload: unknown) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(payload, null, 2));
}

printSection(
  "get_quote",
  handleGetQuote({
    state: "CA",
    zip_code: "94103",
    coverage_type: "homeowners",
  }),
);

printSection(
  "explain_policy",
  handleExplainPolicy({
    policy_id: "HO-94103-001",
    buyer_question: "Does this cover water backup in the basement?",
  }),
);

printSection(
  "check_compliance (clean)",
  handleCheckCompliance({
    response_text: "We will review coverage options with you.",
    state: "TX",
  }),
);

printSection(
  "check_compliance (CA violations)",
  handleCheckCompliance({
    response_text:
      "We guarantee the cheapest rates and earthquake not covered without saying more.",
    state: "CA",
  }),
);

printSection(
  "list_carriers",
  handleListCarriers({
    state: "FL",
    coverage_type: "auto",
  }),
);

printSection(
  "qualify_buyer (hot)",
  handleQualifyBuyer({
    coverage_type: "homeowners",
    zip_code: "80202",
    property_value: 450_000,
    prior_claims: 0,
  }),
);

printSection(
  "qualify_buyer (cold)",
  handleQualifyBuyer({
    coverage_type: "homeowners",
    zip_code: "10001",
    property_value: 1_200_000,
    prior_claims: 3,
  }),
);

console.log("\nDone.");
