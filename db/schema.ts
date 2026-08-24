import { sql } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const platforms = sqliteTable("platforms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  metricLabel: text("metric_label").notNull(),
  accessClass: text("access_class", { enum: ["public", "proxy", "partner", "unavailable"] }).notNull(),
  connectorStatus: text("connector_status", { enum: ["active", "pending", "blocked"] }).notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sourceUrl: text("source_url"),
  collectionMethod: text("collection_method").notNull(),
  licenseNote: text("license_note"),
  lastCheckedAt: text("last_checked_at"),
});

export const playlists = sqliteTable("playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platformId: integer("platform_id").notNull().references(() => platforms.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull(),
  name: text("name").notNull(),
  curator: text("curator").notNull(),
  canonicalUrl: text("canonical_url"),
  platformClass: text("platform_class", { enum: ["audio", "video", "social"] }).notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("playlist_platform_external_uq").on(table.platformId, table.externalId),
  index("playlist_name_idx").on(table.name),
]);

export const playlistMetrics = sqliteTable("playlist_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playlistId: integer("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  metricType: text("metric_type", { enum: ["public_followers", "channel_proxy", "fans", "likes", "connector_pending"] }).notNull(),
  metricValue: integer("metric_value"),
  qualifiesMillion: integer("qualifies_million", { mode: "boolean" }).notNull().default(false),
  confidence: text("confidence", { enum: ["verified", "modeled", "pending"] }).notNull(),
  sourceId: integer("source_id").references(() => sources.id, { onDelete: "set null" }),
  observedAt: text("observed_at").notNull(),
}, (table) => [
  index("metric_playlist_observed_idx").on(table.playlistId, table.observedAt),
  index("metric_qualified_value_idx").on(table.qualifiesMillion, table.metricValue),
]);

export const genres = sqliteTable("genres", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
});

export const playlistGenres = sqliteTable("playlist_genres", {
  playlistId: integer("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  genreId: integer("genre_id").notNull().references(() => genres.id, { onDelete: "cascade" }),
  isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
}, (table) => [primaryKey({ columns: [table.playlistId, table.genreId] })]);

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  stateRegion: text("state_region"),
  county: text("county"),
  townDistrict: text("town_district"),
  city: text("city"),
  parcelRef: text("parcel_ref"),
  parcelConsent: integer("parcel_consent", { mode: "boolean" }).notNull().default(false),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
}, (table) => [
  index("location_country_city_idx").on(table.countryCode, table.city),
  index("location_coordinates_idx").on(table.latitude, table.longitude),
]);

export const playlistLocations = sqliteTable("playlist_locations", {
  playlistId: integer("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  locationId: integer("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  geoRole: text("geo_role", { enum: ["curator", "artist_origin", "audience_aggregate"] }).notNull(),
  confidence: text("confidence", { enum: ["verified", "modeled", "pending"] }).notNull(),
  sourceId: integer("source_id").references(() => sources.id, { onDelete: "set null" }),
}, (table) => [
  primaryKey({ columns: [table.playlistId, table.locationId, table.geoRole] }),
  index("playlist_location_role_idx").on(table.geoRole, table.locationId),
]);

export const ingestionRuns = sqliteTable("ingestion_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platformId: integer("platform_id").notNull().references(() => platforms.id, { onDelete: "cascade" }),
  status: text("status", { enum: ["started", "succeeded", "partial", "failed"] }).notNull(),
  recordsSeen: integer("records_seen").notNull().default(0),
  recordsQualified: integer("records_qualified").notNull().default(0),
  errorSummary: text("error_summary"),
  startedAt: text("started_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  finishedAt: text("finished_at"),
});
