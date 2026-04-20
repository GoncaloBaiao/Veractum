import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null | undefined };

export const DATABASE_UNAVAILABLE_MESSAGE =
  "Database is unavailable. Start PostgreSQL and set DATABASE_URL in .env.";

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getPrismaClient(): PrismaClient | null {
  if (!hasDatabaseUrl()) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    const baseUrl = process.env.DATABASE_URL!;
    const separator = baseUrl.includes("?") ? "&" : "?";
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: baseUrl + separator + "connection_limit=10&pool_timeout=30",
        },
      },
    });
  }

  return globalForPrisma.prisma;
}

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const maybeCode = (error as { code?: string }).code;
  if (maybeCode === "P1001") {
    return true;
  }

  return error.message.includes("P1001") || error.message.includes("Can't reach database server");
}