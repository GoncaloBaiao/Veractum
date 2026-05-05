import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processAnalysisJob } from "@/inngest/functions/processAnalysis";
import { cleanupIpRecords } from "@/inngest/functions/cleanupIpRecords";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processAnalysisJob, cleanupIpRecords],
});
