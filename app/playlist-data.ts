export type MetricType = "public_followers" | "channel_proxy" | "connector_pending";

export type PlaylistRecord = {
  id: string;
  name: string;
  curator: string;
  platform: string;
  platformClass: "audio" | "video" | "social";
  genre: string;
  followers: number | null;
  metricType: MetricType;
  country: string;
  countryCode: string;
  state: string;
  county: string;
  town: string;
  city: string;
  parcel: string;
  lat: number;
  lon: number;
  geoRole: "curator" | "artist_origin" | "audience_aggregate";
  confidence: "verified" | "modeled" | "pending";
  refreshed: string;
  source: string;
  color: string;
};

// Starter catalog. Metrics change constantly, so the database stores dated
// snapshots instead of treating these display values as permanent facts.
export const playlistRecords: PlaylistRecord[] = [
  {
    id: "spt-tth", name: "Today's Top Hits", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "Pop",
    followers: 34_200_000, metricType: "public_followers", country: "United States", countryCode: "US", state: "New York",
    county: "New York County", town: "Manhattan", city: "New York", parcel: "Restricted", lat: 40.7128, lon: -74.006,
    geoRole: "curator", confidence: "verified", refreshed: "2026-08-24", source: "2026 public-page / industry snapshot", color: "#ffcc33",
  },
  {
    id: "spt-global50", name: "Top 50 — Global", curator: "Spotify Charts", platform: "Spotify", platformClass: "audio", genre: "Global Hits",
    followers: 17_000_000, metricType: "public_followers", country: "Global", countryCode: "GL", state: "Worldwide",
    county: "Not applicable", town: "Not applicable", city: "Global", parcel: "Not applicable", lat: 14.1, lon: -18.4,
    geoRole: "audience_aggregate", confidence: "verified", refreshed: "2026-08-24", source: "2026 public-page / industry snapshot", color: "#45e6b2",
  },
  {
    id: "spt-rapcaviar", name: "RapCaviar", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "Hip-Hop",
    followers: 15_700_000, metricType: "public_followers", country: "United States", countryCode: "US", state: "Georgia",
    county: "Fulton County", town: "Atlanta", city: "Atlanta", parcel: "Restricted", lat: 33.749, lon: -84.388,
    geoRole: "artist_origin", confidence: "modeled", refreshed: "2026-08-24", source: "Spotify metric + modeled genre center", color: "#ff6b66",
  },
  {
    id: "spt-viva", name: "Viva Latino", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "Latin",
    followers: 15_400_000, metricType: "public_followers", country: "Puerto Rico", countryCode: "PR", state: "Puerto Rico",
    county: "San Juan Municipio", town: "Santurce", city: "San Juan", parcel: "Restricted", lat: 18.4655, lon: -66.1057,
    geoRole: "artist_origin", confidence: "modeled", refreshed: "2026-08-24", source: "Spotify metric + modeled genre center", color: "#bd83ff",
  },
  {
    id: "spt-rock", name: "Rock Classics", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "Rock",
    followers: 13_000_000, metricType: "public_followers", country: "United Kingdom", countryCode: "GB", state: "England",
    county: "Greater London", town: "Soho", city: "London", parcel: "Restricted", lat: 51.5072, lon: -0.1276,
    geoRole: "artist_origin", confidence: "modeled", refreshed: "2026-08-24", source: "Spotify metric + modeled genre center", color: "#45e6b2",
  },
  {
    id: "spt-hotcountry", name: "Hot Country", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "Country",
    followers: 7_650_000, metricType: "public_followers", country: "United States", countryCode: "US", state: "Tennessee",
    county: "Davidson County", town: "Music Row", city: "Nashville", parcel: "Restricted", lat: 36.1627, lon: -86.7816,
    geoRole: "artist_origin", confidence: "modeled", refreshed: "2026-08-24", source: "Spotify metric + modeled genre center", color: "#ffcc33",
  },
  {
    id: "spt-mint", name: "mint", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "Dance / Electronic",
    followers: 5_485_887, metricType: "public_followers", country: "Germany", countryCode: "DE", state: "Berlin",
    county: "Berlin", town: "Kreuzberg", city: "Berlin", parcel: "Restricted", lat: 52.52, lon: 13.405,
    geoRole: "artist_origin", confidence: "modeled", refreshed: "2026-08-24", source: "Spotify metric + modeled genre center", color: "#45e6b2",
  },
  {
    id: "spt-kpop", name: "K-Pop ON!", curator: "Spotify", platform: "Spotify", platformClass: "audio", genre: "K-Pop",
    followers: 6_124_732, metricType: "public_followers", country: "South Korea", countryCode: "KR", state: "Seoul",
    county: "Yongsan-gu", town: "Itaewon", city: "Seoul", parcel: "Restricted", lat: 37.5665, lon: 126.978,
    geoRole: "artist_origin", confidence: "modeled", refreshed: "2026-08-24", source: "Spotify metric + modeled genre center", color: "#ff78c7",
  },
  {
    id: "ytm-global", name: "Global Top Music Videos", curator: "YouTube Music", platform: "YouTube Music", platformClass: "video", genre: "Global Hits",
    followers: 121_000_000, metricType: "channel_proxy", country: "United States", countryCode: "US", state: "California",
    county: "San Mateo County", town: "San Bruno", city: "San Bruno", parcel: "Restricted", lat: 37.6305, lon: -122.4111,
    geoRole: "curator", confidence: "modeled", refreshed: "2026-08-24", source: "YouTube channel-subscriber proxy", color: "#ff6b66",
  },
  {
    id: "apple-today", name: "Today's Hits", curator: "Apple Music", platform: "Apple Music", platformClass: "audio", genre: "Pop",
    followers: null, metricType: "connector_pending", country: "United States", countryCode: "US", state: "California",
    county: "Santa Clara County", town: "Cupertino", city: "Cupertino", parcel: "Restricted", lat: 37.323, lon: -122.0322,
    geoRole: "curator", confidence: "pending", refreshed: "2026-08-24", source: "Follower total not exposed publicly", color: "#b8c4d4",
  },
  {
    id: "deezer-hits", name: "Top Worldwide", curator: "Deezer Editorial", platform: "Deezer", platformClass: "audio", genre: "Global Hits",
    followers: null, metricType: "connector_pending", country: "France", countryCode: "FR", state: "Île-de-France",
    county: "Paris", town: "Paris Centre", city: "Paris", parcel: "Restricted", lat: 48.8566, lon: 2.3522,
    geoRole: "curator", confidence: "pending", refreshed: "2026-08-24", source: "Deezer connector pending", color: "#bd83ff",
  },
  {
    id: "sc-trending", name: "Trending: Global", curator: "SoundCloud", platform: "SoundCloud", platformClass: "social", genre: "Emerging",
    followers: null, metricType: "connector_pending", country: "Germany", countryCode: "DE", state: "Berlin",
    county: "Berlin", town: "Mitte", city: "Berlin", parcel: "Restricted", lat: 52.5208, lon: 13.4095,
    geoRole: "curator", confidence: "pending", refreshed: "2026-08-24", source: "SoundCloud connector pending", color: "#ff8b3d",
  },
  {
    id: "amazon-hits", name: "Pop Culture", curator: "Amazon Music", platform: "Amazon Music", platformClass: "audio", genre: "Pop",
    followers: null, metricType: "connector_pending", country: "United States", countryCode: "US", state: "Washington",
    county: "King County", town: "South Lake Union", city: "Seattle", parcel: "Restricted", lat: 47.6062, lon: -122.3321,
    geoRole: "curator", confidence: "pending", refreshed: "2026-08-24", source: "Follower total not exposed publicly", color: "#63b7ff",
  },
];

export const platformCoverage = [
  { platform: "Spotify", metric: "Public page + industry snapshots", status: "Follower field absent from 2026 API", grade: "B" },
  { platform: "YouTube Music", metric: "Channel subscribers", status: "Audience proxy", grade: "B" },
  { platform: "Apple Music", metric: "Editorial presence", status: "No public follower total", grade: "D" },
  { platform: "Deezer", metric: "Fans / API field", status: "Connector required", grade: "B" },
  { platform: "SoundCloud", metric: "Likes / repost signals", status: "Connector required", grade: "C" },
  { platform: "Amazon Music", metric: "Editorial presence", status: "No public follower total", grade: "D" },
  { platform: "TIDAL", metric: "Editorial presence", status: "No public follower total", grade: "D" },
  { platform: "Pandora", metric: "Station audience proxy", status: "Partner data required", grade: "D" },
];
