"use client";

import { useEffect, useMemo, useState } from "react";
import { platformCoverage, playlistRecords, type PlaylistRecord } from "./playlist-data";

const number = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function Icon({ name }: { name: "search" | "download" | "map" | "rows" | "close" | "database" | "save" | "terminal" | "copy" | "repository" }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 18v2h16v-2"/></>,
    map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3Z"/><path d="M8 3v15m8-12v15"/></>,
    rows: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></>,
    save: <><path d="M5 3h12l2 2v16H5Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
    terminal: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></>,
    repository: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M4 5.5v16M8 7h8M8 11h6"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function formatFollowers(value: number | null) {
  return value === null ? "Not exposed" : number.format(value);
}

function metricLabel(record: PlaylistRecord) {
  if (record.metricType === "public_followers") return "public followers";
  if (record.metricType === "channel_proxy") return "channel proxy";
  return "connector pending";
}

function downloadCsv(records: PlaylistRecord[]) {
  const fields: (keyof PlaylistRecord)[] = ["name", "curator", "platform", "genre", "followers", "metricType", "country", "state", "county", "town", "city", "parcel", "lat", "lon", "geoRole", "confidence", "refreshed", "source"];
  const safe = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [fields.join(","), ...records.map((row) => fields.map((field) => safe(row[field])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "million-playlist-atlas.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function PlaylistAtlas() {
  const [records, setRecords] = useState<PlaylistRecord[]>(playlistRecords);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All platforms");
  const [genre, setGenre] = useState("All genres");
  const [verification, setVerification] = useState<"qualified" | "coverage">("qualified");
  const [selectedId, setSelectedId] = useState("spt-tth");
  const [view, setView] = useState<"map" | "rows">("map");
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("million-playlist-atlas-view");
      if (!saved) return;
      const value = JSON.parse(saved) as Partial<{ search: string; platform: string; genre: string; verification: "qualified" | "coverage"; selectedId: string; view: "map" | "rows" }>;
      if (typeof value.search === "string") setSearch(value.search);
      if (typeof value.platform === "string") setPlatform(value.platform);
      if (typeof value.genre === "string") setGenre(value.genre);
      if (value.verification === "qualified" || value.verification === "coverage") setVerification(value.verification);
      if (typeof value.selectedId === "string") setSelectedId(value.selectedId);
      if (value.view === "map" || value.view === "rows") setView(value.view);
    } catch {
      window.localStorage.removeItem("million-playlist-atlas-view");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/playlists?coverage=all", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("database unavailable")))
      .then((payload: { records?: PlaylistRecord[] }) => {
        if (Array.isArray(payload.records) && payload.records.length > 0) setRecords(payload.records);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const platforms = useMemo(() => ["All platforms", ...new Set(records.map((row) => row.platform))], [records]);
  const genres = useMemo(() => ["All genres", ...new Set(records.map((row) => row.genre))], [records]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records
      .filter((row) => verification === "coverage" || (row.metricType === "public_followers" && row.followers !== null && row.followers >= 1_000_000))
      .filter((row) => platform === "All platforms" || row.platform === platform)
      .filter((row) => genre === "All genres" || row.genre === genre)
      .filter((row) => !needle || [row.name, row.curator, row.genre, row.country, row.state, row.county, row.town, row.city].join(" ").toLowerCase().includes(needle))
      .sort((a, b) => (b.followers ?? -1) - (a.followers ?? -1));
  }, [records, search, platform, genre, verification]);

  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0] ?? records.find((row) => row.id === selectedId) ?? records[0];
  const verifiedCount = records.filter((row) => row.metricType === "public_followers" && (row.followers ?? 0) >= 1_000_000).length;
  const audienceTotal = records.reduce((sum, row) => sum + (row.metricType === "public_followers" ? row.followers ?? 0 : 0), 0);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2400);
  }

  function saveView() {
    window.localStorage.setItem("million-playlist-atlas-view", JSON.stringify({ search, platform, genre, verification, selectedId: selected.id, view }));
    showNotice("View saved on this device");
  }

  async function copyLocalCommands() {
    await navigator.clipboard.writeText("npm install\nnpm run dev:local");
    showNotice("Local commands copied");
  }

  return (
    <main className="atlas-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Million Plus Playlist Atlas home">
          <span className="brand-mark">M<span>+</span></span>
          <span><strong>Playlist Atlas</strong><small>global audience intelligence</small></span>
        </a>
        <div className="topbar-meta">
          <button className="coverage-link" onClick={() => setCoverageOpen(true)}><span className="status-dot"/>Platform coverage</button>
          <span className="refresh-note">Evidence checked · 24 Aug 2026</span>
          <button className="utility-button" onClick={() => setRunOpen(true)}><Icon name="terminal"/><span>Run locally</span></button>
          <button className="utility-button" onClick={saveView}><Icon name="save"/><span>Save view</span></button>
          <button className="export-button" onClick={() => downloadCsv(filtered)}><Icon name="download"/> Export CSV</button>
        </div>
      </header>

      <section className="workspace" id="top">
        <div className="workspace-heading">
          <div>
            <p className="eyebrow">Public + authorized audience signals</p>
            <h1>Find the playlists<br/><em>moving a million people.</em></h1>
          </div>
          <div className="headline-stat">
            <span>{number.format(audienceTotal)}</span>
            <small>combined public followers<br/>in the starter catalog</small>
          </div>
        </div>

        <div className="control-rack" aria-label="Playlist filters">
          <label className="search-control">
            <span className="sr-only">Search playlists or locations</span>
            <Icon name="search"/>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search playlist, genre, country, city…"/>
            {search && <button aria-label="Clear search" onClick={() => setSearch("")}><Icon name="close"/></button>}
          </label>
          <label><span>Platform</span><select value={platform} onChange={(event) => setPlatform(event.target.value)}>{platforms.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Genre</span><select value={genre} onChange={(event) => setGenre(event.target.value)}>{genres.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="metric-toggle" role="group" aria-label="Metric type">
            <button className={verification === "qualified" ? "active" : ""} onClick={() => setVerification("qualified")}>Million+</button>
            <button className={verification === "coverage" ? "active" : ""} onClick={() => setVerification("coverage")}>All coverage</button>
          </div>
        </div>

        <div className="stats-strip">
          <div><strong>{verifiedCount}</strong><span>reported public<br/>million+ playlists</span></div>
          <div><strong>{new Set(records.map((row) => row.platform)).size}</strong><span>major platforms<br/>represented</span></div>
          <div><strong>{new Set(records.map((row) => row.countryCode)).size}</strong><span>countries +<br/>global audiences</span></div>
          <div className="method-note"><span className="shield">✓</span><span>Counts are labeled by evidence type.<br/><button onClick={() => setCoverageOpen(true)}>Read the metric rules →</button></span></div>
        </div>

        <div className="atlas-grid">
          <section className="map-card">
            <div className="panel-header">
              <div><span className="panel-kicker">Atlas / {verification === "qualified" ? "qualified" : "coverage"}</span><strong>{filtered.length} results</strong></div>
              <div className="view-switch" role="group" aria-label="Result view">
                <button aria-label="Map view" className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Icon name="map"/></button>
                <button aria-label="Table view" className={view === "rows" ? "active" : ""} onClick={() => setView("rows")}><Icon name="rows"/></button>
              </div>
            </div>

            {view === "map" ? (
              <div className="coordinate-map" aria-label="Global playlist coordinate map">
                <div className="map-watermark">LAT / LON</div>
                <div className="latitude-labels" aria-hidden="true"><span>60°N</span><span>30°N</span><span>0°</span><span>30°S</span><span>60°S</span></div>
                <div className="longitude-labels" aria-hidden="true"><span>120°W</span><span>60°W</span><span>0°</span><span>60°E</span><span>120°E</span></div>
                <div className="geo-band americas">AMERICAS</div>
                <div className="geo-band europe">EUROPE</div>
                <div className="geo-band asia">ASIA–PACIFIC</div>
                {filtered.map((row) => {
                  const left = ((row.lon + 180) / 360) * 100;
                  const top = ((90 - row.lat) / 180) * 100;
                  const size = row.followers ? Math.max(12, Math.min(34, 10 + Math.sqrt(row.followers / 1_000_000) * 4)) : 12;
                  return <button
                    key={row.id}
                    className={`map-marker ${selected.id === row.id ? "selected" : ""} ${row.confidence}`}
                    style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, "--marker-color": row.color } as React.CSSProperties}
                    onClick={() => setSelectedId(row.id)}
                    aria-label={`${row.name}, ${formatFollowers(row.followers)}`}
                    title={`${row.name} · ${formatFollowers(row.followers)}`}
                  ><span/></button>;
                })}
                {filtered.length === 0 && <div className="empty-state"><strong>No signals found</strong><span>Try removing a filter or searching a wider location.</span></div>}
                <div className="map-legend"><span><i className="legend-dot verified"/> Public follower metric</span><span><i className="legend-dot modeled"/> Proxy or modeled geo</span><span><i className="legend-dot pending"/> Connector pending</span></div>
              </div>
            ) : (
              <div className="result-table-wrap">
                <table className="result-table">
                  <thead><tr><th>Playlist</th><th>Platform</th><th>Genre</th><th>Audience</th><th>Location</th><th>Evidence</th></tr></thead>
                  <tbody>{filtered.map((row) => <tr key={row.id} className={selected.id === row.id ? "selected" : ""} onClick={() => setSelectedId(row.id)}><td><strong>{row.name}</strong><small>{row.curator}</small></td><td>{row.platform}</td><td>{row.genre}</td><td><strong>{formatFollowers(row.followers)}</strong><small>{metricLabel(row)}</small></td><td>{row.city}<small>{row.country}</small></td><td><span className={`confidence-tag ${row.confidence}`}>{row.confidence}</span></td></tr>)}</tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="detail-card" aria-live="polite">
            <div className="detail-platform"><span className={`platform-icon ${selected.platformClass}`}>{selected.platform.slice(0, 1)}</span><span>{selected.platform}<small>{selected.curator}</small></span><span className={`confidence-tag ${selected.confidence}`}>{selected.confidence}</span></div>
            <h2>{selected.name}</h2>
            <span className="genre-pill">{selected.genre}</span>
            <div className="audience-number"><strong>{formatFollowers(selected.followers)}</strong><span>{metricLabel(selected)}</span></div>
            <div className="metric-bar"><span style={{ width: selected.followers ? `${Math.min(100, Math.max(8, selected.followers / 360_000))}%` : "3%" }}/></div>
            <dl className="geo-list">
              <div><dt>Country</dt><dd>{selected.country}</dd></div>
              <div><dt>State / region</dt><dd>{selected.state}</dd></div>
              <div><dt>County</dt><dd>{selected.county}</dd></div>
              <div><dt>Town / district</dt><dd>{selected.town}</dd></div>
              <div><dt>City</dt><dd>{selected.city}</dd></div>
              <div><dt>GPS</dt><dd>{selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}</dd></div>
              <div><dt>Parcel</dt><dd>{selected.parcel}</dd></div>
              <div><dt>Location role</dt><dd>{selected.geoRole.replaceAll("_", " ")}</dd></div>
            </dl>
            <div className="source-box"><span>Source note</span><strong>{selected.source}</strong><small>Refreshed {selected.refreshed}</small></div>
          </aside>
        </div>

        <section className="method-band">
          <div><Icon name="database"/><span><strong>One record. Three geographies.</strong><small>Curator location, artist origin, and authorized aggregate audience are stored separately—never mashed into one misleading pin.</small></span></div>
          <div className="geo-levels"><span>Country</span><i/> <span>State</span><i/> <span>County</span><i/> <span>Town</span><i/> <span>City</span><i/> <span>GPS</span><i/> <span>Parcel*</span></div>
          <small>*Parcel data is accepted only for owned or explicitly consented first-party records.</small>
        </section>
      </section>

      <footer><span>Million+ Playlist Atlas</span><span>Counts are snapshots, not permanent facts.</span><span>Built for discovery, outreach and market intelligence.</span></footer>

      {notice && <div className="save-toast" role="status">✓ {notice}</div>}

      {runOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setRunOpen(false)}>
        <section className="run-modal" role="dialog" aria-modal="true" aria-labelledby="run-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-heading"><div><p className="eyebrow">Keep your own copy</p><h2 id="run-title">Run it locally</h2></div><button aria-label="Close local instructions" onClick={() => setRunOpen(false)}><Icon name="close"/></button></div>
          <p className="run-intro">Clone the public repository or download the complete source ZIP, then run two commands. Your saved filters stay in your browser; the playlist database and source code stay in your project.</p>
          <div className="action-status"><strong>Do I need to do anything?</strong><span>No. The live site is deployed and the code is already saved in both GitHub repositories. Use the steps below only if you want a separate copy on your computer.</span></div>
          <div className="run-actions"><a className="run-primary" href="https://github.com/midnghtsapphire/playlist-atlas" target="_blank" rel="noreferrer"><Icon name="repository"/>View GitHub repository</a><a className="run-secondary" href="/million-playlist-atlas-source.zip" download><Icon name="download"/>Download source ZIP</a><button className="run-secondary" onClick={copyLocalCommands}><Icon name="copy"/>Copy commands</button></div>
          <ol className="run-steps">
            <li><span>01</span><div><strong>Install Node.js 22 or newer</strong><small>Windows, macOS, or Linux all work.</small></div></li>
            <li><span>02</span><div><strong>Clone or unzip the project</strong><small>In PowerShell or Terminal, change into the project folder.</small></div></li>
            <li><span>03</span><div><strong>Install and start</strong><pre><code>npm install{"\n"}npm run dev:local</code></pre></div></li>
            <li><span>04</span><div><strong>Open the address shown</strong><small>The terminal prints the local web address. Press Ctrl+C when you want to stop it.</small></div></li>
          </ol>
          <div className="local-note"><strong>Database note</strong><span>The interface includes starter data, so it still opens if local D1 is not configured. Database-backed imports require a local Cloudflare D1 setup.</span></div>
          <a className="text-download" href="/RUN-LOCALLY.txt" download>Download the plain-text guide →</a>
        </section>
      </div>}

      {coverageOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setCoverageOpen(false)}>
        <section className="coverage-modal" role="dialog" aria-modal="true" aria-labelledby="coverage-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-heading"><div><p className="eyebrow">Evidence before hype</p><h2 id="coverage-title">Platform coverage</h2></div><button aria-label="Close coverage" onClick={() => setCoverageOpen(false)}><Icon name="close"/></button></div>
          <p>“Follower” is not the same field everywhere. This atlas keeps dated raw metrics and proxies separate so a 100M-subscriber channel is never quietly mislabeled as a 100M-follower playlist. Spotify&apos;s February 2026 API no longer exposes a playlist follower total, so current counts require public-page snapshots or licensed intelligence sources.</p>
          <div className="coverage-table">{platformCoverage.map((row) => <div key={row.platform}><span className={`grade grade-${row.grade.toLowerCase()}`}>{row.grade}</span><strong>{row.platform}</strong><span>{row.metric}</span><small>{row.status}</small></div>)}</div>
          <div className="source-links"><strong>Evidence links</strong><a href="https://developer.spotify.com/documentation/web-api/references/changes/february-2026" target="_blank" rel="noreferrer">Spotify API changes ↗</a><a href="https://developers.google.com/youtube/v3/docs/playlists" target="_blank" rel="noreferrer">YouTube playlist fields ↗</a><a href="https://routenote.com/blog/most-followed-playlists-on-spotify/" target="_blank" rel="noreferrer">June 2026 ranking snapshot ↗</a></div>
          <div className="privacy-note"><strong>Privacy line:</strong> individual listener GPS and parcel data are not scraped. Only public business/curator coordinates, artist-origin modeling, and authorized aggregated analytics belong here.</div>
        </section>
      </div>}
    </main>
  );
}
