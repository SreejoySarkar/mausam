import Redis from 'ioredis';
import { PrismaClient, Prisma } from '../generated/prisma';
import type { RawMetrics, RouteCoordinates } from './dataAggregator';

const TTL_SECONDS = 15 * 60;
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 }) : null;
const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;

function cacheKey(lat: number, lon: number, route?: RouteCoordinates): string {
  const routePart = route
    ? `:${route.originLat},${route.originLon}-${route.destinationLat},${route.destinationLon}`
    : '';
  return `weather:${lat.toFixed(4)}:${lon.toFixed(4)}${routePart}`;
}

function isRawMetrics(value: unknown): value is RawMetrics {
  return typeof value === 'object' && value !== null && 'weatherTempC' in value && 'hourly' in value && 'daily' in value;
}

async function readRedis(key: string): Promise<RawMetrics | null> {
  if (!redis) return null;
  try {
    if (redis.status === 'wait') await redis.connect();
    const raw = await redis.get(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRawMetrics(parsed) ? parsed : null;
  } catch (error) {
    console.warn('[cache] Redis read skipped:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function writeRedis(key: string, metrics: RawMetrics): Promise<void> {
  if (!redis) return;
  try {
    if (redis.status === 'wait') await redis.connect();
    await redis.set(key, JSON.stringify(metrics), 'EX', TTL_SECONDS);
  } catch (error) {
    console.warn('[cache] Redis write skipped:', error instanceof Error ? error.message : error);
  }
}

async function readPostgres(key: string): Promise<RawMetrics | null> {
  if (!prisma) return null;
  try {
    const snapshot = await prisma.weatherSnapshot.findUnique({ where: { cacheKey: key } });
    if (!snapshot || snapshot.expiresAt <= new Date() || !isRawMetrics(snapshot.payload)) return null;
    return snapshot.payload;
  } catch (error) {
    console.warn('[cache] Postgres read skipped:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function writePostgres(key: string, metrics: RawMetrics): Promise<void> {
  if (!prisma) return;
  try {
    const now = new Date();
    await prisma.weatherSnapshot.upsert({
      where: { cacheKey: key },
      create: { cacheKey: key, payload: metrics as unknown as Prisma.InputJsonValue, cachedAt: now, expiresAt: new Date(now.getTime() + TTL_SECONDS * 1000) },
      update: { payload: metrics as unknown as Prisma.InputJsonValue, cachedAt: now, expiresAt: new Date(now.getTime() + TTL_SECONDS * 1000) },
    });
  } catch (error) {
    console.warn('[cache] Postgres write skipped:', error instanceof Error ? error.message : error);
  }
}

export async function readMetricsCache(lat: number, lon: number, route?: RouteCoordinates): Promise<RawMetrics | null> {
  const key = cacheKey(lat, lon, route);
  const redisValue = await readRedis(key);
  if (redisValue) return redisValue;
  const databaseValue = await readPostgres(key);
  if (databaseValue) await writeRedis(key, databaseValue);
  return databaseValue;
}

export async function writeMetricsCache(lat: number, lon: number, metrics: RawMetrics, route?: RouteCoordinates): Promise<void> {
  const key = cacheKey(lat, lon, route);
  await Promise.allSettled([writeRedis(key, metrics), writePostgres(key, metrics)]);
}
