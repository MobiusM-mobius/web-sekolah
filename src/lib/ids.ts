const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Prisma throws (500) on malformed UUIDs; routes check first so bad IDs return 404.
export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);
