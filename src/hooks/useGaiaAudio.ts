import { useRef, useCallback, useEffect, useState } from 'react';

interface AudioManifest {
  voice: string;
  clips: Record<string, { file: string; duration: number; text: string }>;
}

const AUDIO_BASE = '/audio/gaia/';

export function useGaiaAudio() {
  const [manifest, setManifest] = useState<AudioManifest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentClip, setCurrentClip] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const queueRef = useRef<string[]>([]);
  const playingRef = useRef(false);

  // Load manifest
  useEffect(() => {
    fetch(AUDIO_BASE + 'manifest.json')
      .then(r => r.json())
      .then(setManifest)
      .catch(console.error);
  }, []);

  // Preload a clip into cache
  const preload = useCallback((clipId: string) => {
    if (!manifest || cacheRef.current.has(clipId)) return;
    const clip = manifest.clips[clipId];
    if (!clip) return;
    const audio = new Audio(AUDIO_BASE + clip.file);
    audio.preload = 'auto';
    cacheRef.current.set(clipId, audio);
  }, [manifest]);

  // Preload multiple clips
  const preloadMany = useCallback((clipIds: string[]) => {
    clipIds.forEach(preload);
  }, [preload]);

  // Play a single clip, returns a promise that resolves when done
  const play = useCallback((clipId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!manifest || !enabledRef.current) {
        resolve();
        return;
      }
      const clip = manifest.clips[clipId];
      if (!clip) {
        resolve();
        return;
      }

      // Stop current
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Get or create audio element
      let audio = cacheRef.current.get(clipId);
      if (!audio) {
        audio = new Audio(AUDIO_BASE + clip.file);
        cacheRef.current.set(clipId, audio);
      }

      audioRef.current = audio;
      setCurrentClip(clipId);
      setIsPlaying(true);
      playingRef.current = true;

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentClip(null);
        playingRef.current = false;
        resolve();
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentClip(null);
        playingRef.current = false;
        reject(new Error(`Failed to play: ${clipId}`));
      };

      audio.play().catch(() => {
        setIsPlaying(false);
        playingRef.current = false;
        resolve(); // Silently fail if autoplay blocked
      });
    });
  }, [manifest, enabled]);

  // Play a sequence of clips
  const playSequence = useCallback(async (clipIds: string[], delayBetween = 300) => {
    for (const clipId of clipIds) {
      if (!playingRef.current && clipIds.indexOf(clipId) > 0) break; // stopped
      await play(clipId);
      if (delayBetween > 0) {
        await new Promise(r => setTimeout(r, delayBetween));
      }
    }
  }, [play]);

  // Stop playback
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentClip(null);
    playingRef.current = false;
    queueRef.current = [];
  }, []);

  // Get clip info
  const getClip = useCallback((clipId: string) => {
    return manifest?.clips[clipId] || null;
  }, [manifest]);

  // Enable audio (must be called from user interaction)
  const enable = useCallback(() => {
    enabledRef.current = true;
    setEnabled(true);
    // Create and play a silent audio to unlock audio context
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    silent.play().catch(() => {});
  }, []);

  return {
    play,
    playSequence,
    stop,
    preload,
    preloadMany,
    enable,
    getClip,
    isPlaying,
    currentClip,
    enabled,
    manifest,
  };
}
