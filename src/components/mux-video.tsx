import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { muxStreamUrl } from '@/lib/mux';

/**
 * Plays a Mux HLS stream via `expo-video` (bundled in Expo Go — no dev build).
 * HLS is handled natively by AVPlayer on iOS; on web it relies on the browser's
 * own HLS support (Safari yes, Chrome no), which is fine since the device is the
 * primary target.
 *
 * Goes fullscreen automatically the first time playback starts, and calls
 * `onEnded` once the video plays through — the lesson screen uses that to unlock
 * the test (you must watch the video before taking the quiz).
 */
type Props = {
  playbackId: string;
  title?: string;
  /** Shown as the player background while the first frame loads. */
  accent?: string;
  /** Fires once the video has played through to the end. */
  onEnded?: () => void;
};

export function MuxVideo({ playbackId, title, accent, onEnded }: Props) {
  const viewRef = useRef<VideoView>(null);
  const didAutoFullscreen = useRef(false);
  // Keep the latest callback without re-subscribing the player listeners.
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const player = useVideoPlayer(
    { uri: muxStreamUrl(playbackId), metadata: title ? { title } : undefined },
    (p) => {
      p.loop = false;
    },
  );

  useEffect(() => {
    // First time the user hits play, take it fullscreen.
    const playingSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (isPlaying && !didAutoFullscreen.current) {
        didAutoFullscreen.current = true;
        viewRef.current?.enterFullscreen().catch(() => {});
      }
    });
    // Watched to the end → unlock the test.
    const endSub = player.addListener('playToEnd', () => {
      onEndedRef.current?.();
    });
    return () => {
      playingSub.remove();
      endSub.remove();
    };
  }, [player]);

  return (
    <View style={[styles.container, accent ? { backgroundColor: accent } : null]}>
      <VideoView
        ref={viewRef}
        style={styles.video}
        player={player}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
