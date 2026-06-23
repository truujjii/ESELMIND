/**
 * Mux URL builders. Playback IDs with a **public** playback policy are safe to
 * ship in the app — these URLs need no token. (The Mux *API* token, used only by
 * `scripts/sync-mux.mjs` to list your library, never reaches the app.)
 *
 * Docs: https://docs.mux.com/guides/play-your-videos
 */

import { MUX_LIBRARY } from '@/data/mux-library.generated';

/**
 * Public playback id for a lesson, sourced from the synced Mux library by
 * `passthrough`, or `null` if no video is mapped yet (→ placeholder player).
 */
export function playbackIdForLesson(lessonId: string): string | null {
  return MUX_LIBRARY.find((entry) => entry.passthrough === lessonId)?.playbackId ?? null;
}

/** HLS stream URL for an `expo-video` source. */
export function muxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/** Still thumbnail (defaults to a JPG at the given time, 0s = first frame). */
export function muxThumbnailUrl(
  playbackId: string,
  opts: { timeSec?: number; width?: number } = {},
): string {
  const params = new URLSearchParams();
  if (opts.timeSec != null) params.set('time', String(opts.timeSec));
  if (opts.width != null) params.set('width', String(opts.width));
  const query = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${query ? `?${query}` : ''}`;
}
