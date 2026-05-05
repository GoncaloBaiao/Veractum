import { inngest } from "@/inngest/client";
import { getPrismaClient } from "@/lib/prisma";

export const cleanupIpRecords = inngest.createFunction(
  {
    id: "cleanup-ip-records",
    triggers: [{ cron: "0 3 * * *" }], // runs daily at 3am UTC
  },
  async () => {
    const prisma = getPrismaClient();
    if (!prisma) return;

    // Delete records older than 7 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    await prisma.ipRateLimit.deleteMany({
      where: { date: { lt: cutoffDate } },
    });
  }
);
