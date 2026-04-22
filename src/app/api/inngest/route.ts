import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processAnalysisJob } from "@/inngest/functions/processAnalysis";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processAnalysisJob],
});
