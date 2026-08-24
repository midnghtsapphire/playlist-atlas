import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://million-playlist-atlas.angelreporters.chatgpt.site"),
  title: "Million+ Playlist Atlas",
  description: "Search million-follower playlists across platforms, genres and global geography.",
  openGraph: {
    title: "Million+ Playlist Atlas",
    description: "Global playlist audience intelligence—mapped, sourced and searchable.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Million+ Playlist Atlas global audience map" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Million+ Playlist Atlas",
    description: "Global playlist audience intelligence—mapped, sourced and searchable.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
