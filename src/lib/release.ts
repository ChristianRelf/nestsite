import { useEffect, useState } from 'react';
import { SNAPSHOT } from './release-snapshot';
import type { Eyes, Shape } from './shapes';

export interface Asset {
  name: string;
  size: number;
  url: string;
  /** "sha256:…" when GitHub has computed it. */
  digest: string | null;
}

export interface Release {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
  prerelease: boolean;
  body: string;
  assets: Asset[];
}

const API = 'https://api.github.com/repos/UseNestBot/Nest-Bot/releases?per_page=10';
const CACHE = 'nest:releases:v1';
const TTL = 10 * 60 * 1000;

type Raw = {
  tag_name: string; name: string | null; published_at: string; html_url: string; draft: boolean; prerelease: boolean; body: string | null;
  assets: { name: string; size: number; browser_download_url: string; digest?: string | null }[];
};

const fromApi = (raw: Raw[]): Release[] =>
  raw
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      publishedAt: r.published_at,
      url: r.html_url,
      prerelease: r.prerelease,
      body: r.body ?? '',
      assets: r.assets.map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url, digest: a.digest ?? null })),
    }));

/**
 * Releases straight from GitHub. Starts from the snapshot baked in at build time,
 * so the page never waits on (or breaks without) the API, then swaps in live data.
 */
export function useReleases() {
  const [state, setState] = useState<{ releases: Release[]; live: boolean }>({ releases: SNAPSHOT, live: false });

  useEffect(() => {
    try {
      const hit = JSON.parse(sessionStorage.getItem(CACHE) ?? 'null') as { at: number; releases: Release[] } | null;
      if (hit && Date.now() - hit.at < TTL && hit.releases.length) {
        setState({ releases: hit.releases, live: true });
        return;
      }
    } catch { /* storage blocked: just fetch */ }

    const ctl = new AbortController();
    fetch(API, { headers: { Accept: 'application/vnd.github+json' }, signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((raw: Raw[]) => {
        const releases = fromApi(raw);
        if (!releases.length) return;
        setState({ releases, live: true });
        try { sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), releases })); } catch { /* fine */ }
      })
      .catch(() => { /* keep the snapshot */ });
    return () => ctl.abort();
  }, []);

  const latest = state.releases.find((r) => !r.prerelease) ?? state.releases[0];
  return { ...state, latest, older: state.releases.filter((r) => r !== latest) };
}

/* ---------------- Platforms ---------------- */

export type Kind = 'windows' | 'appimage' | 'deb' | 'rpm' | 'mac';
export type OS = 'windows' | 'linux' | 'mac' | 'mobile';

export interface Platform {
  kind: Kind;
  os: Exclude<OS, 'mobile'>;
  title: string;
  subtitle: string;
  blurb: string;
  match: RegExp;
  jit: { shape: Shape; color: string; eyes: Eyes };
  /** What to do once it's downloaded. */
  howto: (file: string) => { cmd?: string; text: string };
}

export const PLATFORMS: Platform[] = [
  {
    kind: 'windows', os: 'windows', title: 'Windows', subtitle: 'Windows 10 & 11 · x64',
    blurb: 'A per-user installer with desktop and Start Menu shortcuts. No admin rights needed.',
    match: /\.exe$/i, jit: { shape: 'square', color: '#3b82f6', eyes: 'dots' },
    howto: () => ({ text: 'Run the installer. SmartScreen may warn about an unsigned app: choose More info, then Run anyway.' }),
  },
  {
    kind: 'appimage', os: 'linux', title: 'AppImage', subtitle: 'Any Linux · x64',
    blurb: 'One portable file that runs on most distributions. Nothing to install.',
    match: /\.AppImage$/i, jit: { shape: 'triangle', color: '#f06f2c', eyes: 'wide' },
    howto: (f) => ({ cmd: `chmod +x ${f} && ./${f}`, text: 'Make it executable, then run it.' }),
  },
  {
    kind: 'deb', os: 'linux', title: 'Debian / Ubuntu', subtitle: '.deb package · x64',
    blurb: 'A native package for Debian, Ubuntu, Mint and friends, with a menu entry.',
    match: /\.deb$/i, jit: { shape: 'blob', color: '#e5484d', eyes: 'happy' },
    howto: (f) => ({ cmd: `sudo apt install ./${f}`, text: 'Install it with apt from the folder you saved it to.' }),
  },
  {
    kind: 'rpm', os: 'linux', title: 'Fedora / RHEL', subtitle: '.rpm package · x64',
    blurb: 'A native package for Fedora, RHEL and openSUSE.',
    match: /\.rpm$/i, jit: { shape: 'hex', color: '#3fb5a3', eyes: 'dots' },
    howto: (f) => ({ cmd: `sudo dnf install ./${f}`, text: 'Install it with dnf from the folder you saved it to.' }),
  },
  {
    kind: 'mac', os: 'mac', title: 'macOS', subtitle: 'Apple silicon & Intel',
    blurb: 'Drag Nest into Applications.',
    match: /\.dmg$/i, jit: { shape: 'leaf', color: '#4cbe6c', eyes: 'dots' },
    howto: () => ({ text: 'Open the disk image and drag Nest into Applications.' }),
  },
];

export interface Build { platform: Platform; asset: Asset }

/** Installable files only: drops updater manifests and blockmaps. */
export function builds(r: Release | undefined): Build[] {
  if (!r) return [];
  return PLATFORMS.flatMap((platform) => {
    const asset = r.assets.find((a) => platform.match.test(a.name));
    return asset ? [{ platform, asset }] : [];
  });
}

export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'windows';
  const nav = navigator as Navigator & { userAgentData?: { platform?: string; mobile?: boolean } };
  const ua = `${nav.userAgentData?.platform ?? ''} ${navigator.userAgent}`.toLowerCase();
  if (nav.userAgentData?.mobile || /android|iphone|ipad|ipod/.test(ua)) return 'mobile';
  if (/win/.test(ua)) return 'windows';
  if (/mac/.test(ua)) return 'mac';
  if (/linux|x11|cros/.test(ua)) return 'linux';
  return 'windows';
}

/** The build to offer first on this OS (the AppImage on Linux: it runs anywhere). */
export function pickFor(os: OS, list: Build[]): Build | undefined {
  if (os === 'mobile') return undefined;
  return list.find((b) => b.platform.os === os);
}

export const formatSize = (bytes: number) =>
  bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : bytes >= 1e6 ? `${Math.round(bytes / 1e6)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function ago(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}
