import { env } from "cloudflare:workers";

const playlistQuery = `
  SELECT
    p.external_id AS id,
    p.name AS name,
    p.curator AS curator,
    pf.name AS platform,
    p.platform_class AS platformClass,
    g.name AS genre,
    pm.metric_value AS followers,
    pm.metric_type AS metricType,
    l.country AS country,
    l.country_code AS countryCode,
    l.state_region AS state,
    l.county AS county,
    l.town_district AS town,
    l.city AS city,
    COALESCE(l.parcel_ref, 'Not available') AS parcel,
    l.latitude AS lat,
    l.longitude AS lon,
    ploc.geo_role AS geoRole,
    ploc.confidence AS confidence,
    pm.observed_at AS refreshed,
    CASE
      WHEN pm.metric_type = 'public_followers' THEN 'Public playlist metric snapshot'
      WHEN pm.metric_type = 'channel_proxy' THEN 'Channel subscriber proxy — not playlist followers'
      ELSE 'Follower total not exposed publicly'
    END AS source,
    CASE g.slug
      WHEN 'pop' THEN '#ffcc33'
      WHEN 'global-hits' THEN '#45e6b2'
      WHEN 'hip-hop' THEN '#ff6b66'
      WHEN 'latin' THEN '#bd83ff'
      WHEN 'k-pop' THEN '#ff78c7'
      WHEN 'emerging' THEN '#ff8b3d'
      ELSE '#63b7ff'
    END AS color
  FROM playlists p
  JOIN platforms pf ON pf.id = p.platform_id
  JOIN playlist_metrics pm ON pm.id = (
    SELECT pm2.id FROM playlist_metrics pm2
    WHERE pm2.playlist_id = p.id
    ORDER BY pm2.observed_at DESC, pm2.id DESC
    LIMIT 1
  )
  JOIN playlist_genres pg ON pg.playlist_id = p.id AND pg.is_primary = 1
  JOIN genres g ON g.id = pg.genre_id
  JOIN playlist_locations ploc ON ploc.playlist_id = p.id
  JOIN locations l ON l.id = ploc.location_id
  WHERE p.active = 1
    AND (?1 = 1 OR (pm.metric_type = 'public_followers' AND pm.metric_value >= 1000000))
    AND (?2 = '' OR pf.slug = ?2)
    AND (?3 = '' OR g.slug = ?3)
    AND (
      ?4 = '' OR
      lower(p.name || ' ' || p.curator || ' ' || g.name || ' ' || l.country || ' ' || COALESCE(l.state_region,'') || ' ' || COALESCE(l.county,'') || ' ' || COALESCE(l.town_district,'') || ' ' || COALESCE(l.city,'')) LIKE '%' || lower(?4) || '%'
    )
  ORDER BY COALESCE(pm.metric_value, -1) DESC, p.name ASC
  LIMIT 1000
`;

export async function GET(request: Request) {
  try {
    if (!env.DB) return Response.json({ error: "Playlist database is unavailable." }, { status: 503 });

    const url = new URL(request.url);
    const includeCoverage = url.searchParams.get("coverage") === "all" ? 1 : 0;
    const platform = url.searchParams.get("platform")?.trim().toLowerCase() ?? "";
    const genre = url.searchParams.get("genre")?.trim().toLowerCase() ?? "";
    const query = url.searchParams.get("q")?.trim().slice(0, 120) ?? "";
    const result = await env.DB.prepare(playlistQuery).bind(includeCoverage, platform, genre, query).all();

    return Response.json({ records: result.results, source: "d1", count: result.results.length }, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected database error";
    return Response.json({ error: message }, { status: 500 });
  }
}
