-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "cacheKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "cachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("cacheKey")
);

-- CreateIndex
CREATE INDEX "WeatherSnapshot_expiresAt_idx" ON "WeatherSnapshot"("expiresAt");
