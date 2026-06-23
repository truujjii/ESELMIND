import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { muxStreamUrl } from '@/lib/mux';

/**
 * Plays a Mux HLS stream via `expo-video` (bundled in Expo Go — no dev build).
 * HLS is handled natively by AVPlayer on iOS; on web it relies on the browser's
 * own HLS support (Safari yes, Chrome no), which is fine since the device is the
 * primary target.
 */
type Props = {
  playbackId: string;
  title?: string;
  /** Shown as the player background while the first frame loads. */
  accent?: string;
};

export function MuxVideo({ playbackId, title, accent }: Props) {
  const player = useVideoPlayer(
    { uri: muxStreamUrl(playbackId), metadata: title ? { title } : undefined },
    (p) => {
      p.loop = false;
    },
  );

  return (
    <View style={[styles.container, accent ? { backgroundColor: accent } : null]}>
      <VideoView
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
