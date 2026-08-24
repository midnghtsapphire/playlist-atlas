CREATE TABLE `genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`parent_id` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genres_slug_unique` ON `genres` (`slug`);--> statement-breakpoint
CREATE TABLE `ingestion_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_id` integer NOT NULL,
	`status` text NOT NULL,
	`records_seen` integer DEFAULT 0 NOT NULL,
	`records_qualified` integer DEFAULT 0 NOT NULL,
	`error_summary` text,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`finished_at` text,
	FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`country` text NOT NULL,
	`country_code` text NOT NULL,
	`state_region` text,
	`county` text,
	`town_district` text,
	`city` text,
	`parcel_ref` text,
	`parcel_consent` integer DEFAULT false NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `location_country_city_idx` ON `locations` (`country_code`,`city`);--> statement-breakpoint
CREATE INDEX `location_coordinates_idx` ON `locations` (`latitude`,`longitude`);--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`metric_label` text NOT NULL,
	`access_class` text NOT NULL,
	`connector_status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platforms_slug_unique` ON `platforms` (`slug`);--> statement-breakpoint
CREATE TABLE `playlist_genres` (
	`playlist_id` integer NOT NULL,
	`genre_id` integer NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`playlist_id`, `genre_id`),
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `playlist_locations` (
	`playlist_id` integer NOT NULL,
	`location_id` integer NOT NULL,
	`geo_role` text NOT NULL,
	`confidence` text NOT NULL,
	`source_id` integer,
	PRIMARY KEY(`playlist_id`, `location_id`, `geo_role`),
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `playlist_location_role_idx` ON `playlist_locations` (`geo_role`,`location_id`);--> statement-breakpoint
CREATE TABLE `playlist_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer NOT NULL,
	`metric_type` text NOT NULL,
	`metric_value` integer,
	`qualifies_million` integer DEFAULT false NOT NULL,
	`confidence` text NOT NULL,
	`source_id` integer,
	`observed_at` text NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `metric_playlist_observed_idx` ON `playlist_metrics` (`playlist_id`,`observed_at`);--> statement-breakpoint
CREATE INDEX `metric_qualified_value_idx` ON `playlist_metrics` (`qualifies_million`,`metric_value`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`platform_id` integer NOT NULL,
	`external_id` text NOT NULL,
	`name` text NOT NULL,
	`curator` text NOT NULL,
	`canonical_url` text,
	`platform_class` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_platform_external_uq` ON `playlists` (`platform_id`,`external_id`);--> statement-breakpoint
CREATE INDEX `playlist_name_idx` ON `playlists` (`name`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`source_url` text,
	`collection_method` text NOT NULL,
	`license_note` text,
	`last_checked_at` text
);
--> statement-breakpoint
INSERT INTO `platforms` (`id`,`slug`,`name`,`metric_label`,`access_class`,`connector_status`) VALUES
  (1,'spotify','Spotify','Public page + industry snapshots','proxy','active'),
  (2,'youtube-music','YouTube Music','Channel subscribers','proxy','active'),
  (3,'apple-music','Apple Music','Editorial presence','unavailable','blocked'),
  (4,'deezer','Deezer','Fans / API field','partner','pending'),
  (5,'soundcloud','SoundCloud','Likes / repost signals','partner','pending'),
  (6,'amazon-music','Amazon Music','Editorial presence','unavailable','blocked'),
  (7,'tidal','TIDAL','Editorial presence','unavailable','blocked'),
  (8,'pandora','Pandora','Station audience proxy','partner','pending');
--> statement-breakpoint
INSERT INTO `sources` (`id`,`name`,`collection_method`,`license_note`,`last_checked_at`) VALUES
  (1,'Public playlist snapshot','Public metric snapshot','Metrics are stored with observation dates','2026-08-24'),
  (2,'Modeled genre geography','Editorial modeling','Approximate genre center; not a listener location','2026-08-24'),
  (3,'YouTube channel proxy','Public channel statistic','Proxy only; never represented as playlist followers','2026-08-24'),
  (4,'Connector coverage record','Platform coverage review','No public follower total in the starter catalog','2026-08-24');
--> statement-breakpoint
INSERT INTO `genres` (`id`,`slug`,`name`) VALUES
  (1,'pop','Pop'),(2,'global-hits','Global Hits'),(3,'hip-hop','Hip-Hop'),(4,'latin','Latin'),(5,'rock','Rock'),
  (6,'country','Country'),(7,'dance-electronic','Dance / Electronic'),(8,'k-pop','K-Pop'),(9,'emerging','Emerging');
--> statement-breakpoint
INSERT INTO `locations` (`id`,`country`,`country_code`,`state_region`,`county`,`town_district`,`city`,`parcel_ref`,`parcel_consent`,`latitude`,`longitude`) VALUES
  (1,'United States','US','New York','New York County','Manhattan','New York','Restricted',0,40.7128,-74.0060),
  (2,'Global','GL','Worldwide','Not applicable','Not applicable','Global','Not applicable',0,14.1000,-18.4000),
  (3,'United States','US','Georgia','Fulton County','Atlanta','Atlanta','Restricted',0,33.7490,-84.3880),
  (4,'Puerto Rico','PR','Puerto Rico','San Juan Municipio','Santurce','San Juan','Restricted',0,18.4655,-66.1057),
  (5,'United Kingdom','GB','England','Greater London','Soho','London','Restricted',0,51.5072,-0.1276),
  (6,'United States','US','Tennessee','Davidson County','Music Row','Nashville','Restricted',0,36.1627,-86.7816),
  (7,'Germany','DE','Berlin','Berlin','Kreuzberg','Berlin','Restricted',0,52.5200,13.4050),
  (8,'South Korea','KR','Seoul','Yongsan-gu','Itaewon','Seoul','Restricted',0,37.5665,126.9780),
  (9,'United States','US','California','San Mateo County','San Bruno','San Bruno','Restricted',0,37.6305,-122.4111),
  (10,'United States','US','California','Santa Clara County','Cupertino','Cupertino','Restricted',0,37.3230,-122.0322),
  (11,'France','FR','Île-de-France','Paris','Paris Centre','Paris','Restricted',0,48.8566,2.3522),
  (12,'Germany','DE','Berlin','Berlin','Mitte','Berlin','Restricted',0,52.5208,13.4095),
  (13,'United States','US','Washington','King County','South Lake Union','Seattle','Restricted',0,47.6062,-122.3321);
--> statement-breakpoint
INSERT INTO `playlists` (`id`,`platform_id`,`external_id`,`name`,`curator`,`platform_class`,`active`,`updated_at`) VALUES
  (1,1,'spt-tth','Today''s Top Hits','Spotify','audio',1,'2026-08-24'),
  (2,1,'spt-global50','Top 50 — Global','Spotify Charts','audio',1,'2026-08-24'),
  (3,1,'spt-rapcaviar','RapCaviar','Spotify','audio',1,'2026-08-24'),
  (4,1,'spt-viva','Viva Latino','Spotify','audio',1,'2026-08-24'),
  (5,1,'spt-rock','Rock Classics','Spotify','audio',1,'2026-08-24'),
  (6,1,'spt-hotcountry','Hot Country','Spotify','audio',1,'2026-08-24'),
  (7,1,'spt-mint','mint','Spotify','audio',1,'2026-08-24'),
  (8,1,'spt-kpop','K-Pop ON!','Spotify','audio',1,'2026-08-24'),
  (9,2,'ytm-global','Global Top Music Videos','YouTube Music','video',1,'2026-08-24'),
  (10,3,'apple-today','Today''s Hits','Apple Music','audio',1,'2026-08-24'),
  (11,4,'deezer-hits','Top Worldwide','Deezer Editorial','audio',1,'2026-08-24'),
  (12,5,'sc-trending','Trending: Global','SoundCloud','social',1,'2026-08-24'),
  (13,6,'amazon-hits','Pop Culture','Amazon Music','audio',1,'2026-08-24');
--> statement-breakpoint
INSERT INTO `playlist_metrics` (`playlist_id`,`metric_type`,`metric_value`,`qualifies_million`,`confidence`,`source_id`,`observed_at`) VALUES
  (1,'public_followers',34200000,1,'verified',1,'2026-08-24'),
  (2,'public_followers',17000000,1,'verified',1,'2026-08-24'),
  (3,'public_followers',15700000,1,'modeled',1,'2026-08-24'),
  (4,'public_followers',15400000,1,'modeled',1,'2026-08-24'),
  (5,'public_followers',13000000,1,'modeled',1,'2026-08-24'),
  (6,'public_followers',7650000,1,'modeled',1,'2026-08-24'),
  (7,'public_followers',5485887,1,'modeled',1,'2026-08-24'),
  (8,'public_followers',6124732,1,'modeled',1,'2026-08-24'),
  (9,'channel_proxy',121000000,0,'modeled',3,'2026-08-24'),
  (10,'connector_pending',NULL,0,'pending',4,'2026-08-24'),
  (11,'connector_pending',NULL,0,'pending',4,'2026-08-24'),
  (12,'connector_pending',NULL,0,'pending',4,'2026-08-24'),
  (13,'connector_pending',NULL,0,'pending',4,'2026-08-24');
--> statement-breakpoint
INSERT INTO `playlist_genres` (`playlist_id`,`genre_id`,`is_primary`) VALUES
  (1,1,1),(2,2,1),(3,3,1),(4,4,1),(5,5,1),(6,6,1),(7,7,1),(8,8,1),(9,2,1),(10,1,1),(11,2,1),(12,9,1),(13,1,1);
--> statement-breakpoint
INSERT INTO `playlist_locations` (`playlist_id`,`location_id`,`geo_role`,`confidence`,`source_id`) VALUES
  (1,1,'curator','verified',1),(2,2,'audience_aggregate','verified',1),(3,3,'artist_origin','modeled',2),
  (4,4,'artist_origin','modeled',2),(5,5,'artist_origin','modeled',2),(6,6,'artist_origin','modeled',2),
  (7,7,'artist_origin','modeled',2),(8,8,'artist_origin','modeled',2),(9,9,'curator','modeled',3),
  (10,10,'curator','pending',4),(11,11,'curator','pending',4),(12,12,'curator','pending',4),(13,13,'curator','pending',4);
