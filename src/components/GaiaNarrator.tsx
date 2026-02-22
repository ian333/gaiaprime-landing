import { useState, useEffect, useRef, useCallback } from 'react';

interface GaiaNarratorProps {
  gaiaAudio: {
    play: (id: string) => Promise<void>;
    stop: () => void;
    preloadMany: (ids: string[]) => void;
    isPlaying: boolean;
    currentClip: string | null;
    enabled: boolean;
    getClip: (id: string) => { text: string; duration: number } | null;
  };
  active: boolean;
}

// Map section IDs to their narration clips  
const SECTION_NARRATIONS: Record<string, string[]> = {
  'hero-section': ['hero_dashboard'],
  'pain-section': ['pain_intro', 'pain_solucion'],
  'solution-section': [],
  'modules-section': ['mod_hermes_titulo', 'mod_athena_titulo', 'mod_hephaestus_titulo'],
  'comparison-section': ['comp_intro'],
  'pricing-section': ['precio_titulo', 'precio_cierre'],
  'final-section': ['cierre_pregunta', 'cierre_accion'],
};

export function GaiaNarrator({ gaiaAudio, active }: GaiaNarratorProps) {
  const [visible, setVisible] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [subtitleText, setSubtitleText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState<'left' | 'right'>('right');
  const playedRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Preload all narration clips when active
  useEffect(() => {
    if (!active) return;
    const allClips = Object.values(SECTION_NARRATIONS).flat();
    gaiaAudio.preloadMany(allClips);

    // Show narrator after a brief delay
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, [active, gaiaAudio]);

  // Track speaking state from audio
  useEffect(() => {
    setSpeaking(gaiaAudio.isPlaying);
    if (gaiaAudio.currentClip) {
      const clip = gaiaAudio.getClip(gaiaAudio.currentClip);
      if (clip) {
        setSubtitleText(clip.text);
        setShowSubtitle(true);
      }
    } else {
      // Hide subtitle after a delay
      const t = setTimeout(() => setShowSubtitle(false), 1500);
      return () => clearTimeout(t);
    }
  }, [gaiaAudio.isPlaying, gaiaAudio.currentClip, gaiaAudio]);

  // Play narration for a section
  const narrateSection = useCallback(async (sectionId: string) => {
    if (muted || !gaiaAudio.enabled) return;
    if (playedRef.current.has(sectionId)) return;

    const clips = SECTION_NARRATIONS[sectionId];
    if (!clips || clips.length === 0) return;

    playedRef.current.add(sectionId);

    for (const clipId of clips) {
      await gaiaAudio.play(clipId);
      await new Promise(r => setTimeout(r, 400));
    }
  }, [gaiaAudio, muted]);

  // Set up IntersectionObserver to trigger narration
  useEffect(() => {
    if (!active) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id && SECTION_NARRATIONS[id]) {
              narrateSection(id);

              // Move narrator to opposite side of content
              const rect = entry.target.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              setPosition(centerX > window.innerWidth / 2 ? 'left' : 'right');
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -20% 0px' }
    );

    // Observe sections with narration
    Object.keys(SECTION_NARRATIONS).forEach(sectionId => {
      const el = document.getElementById(sectionId);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [active, narrateSection]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) gaiaAudio.stop();
      return !prev;
    });
  }, [gaiaAudio]);

  if (!active || !visible) return null;

  return (
    <>
      {/* Floating GAIA Narrator */}
      <div className={`gaia-narrator ${position === 'left' ? 'gaia-narrator-left' : 'gaia-narrator-right'}`}>
        {/* Orb */}
        <div
          className={`gaia-narrator-orb ${speaking ? 'gaia-narrator-speaking' : ''}`}
          onClick={toggleMute}
          title={muted ? 'Activar voz' : 'Silenciar a GAIA'}
        >
          <div className="gaia-narrator-orb-inner">
            {muted ? '🔇' : '✦'}
          </div>
          {speaking && !muted && (
            <>
              <div className="gaia-narrator-wave gaia-narrator-wave-1" />
              <div className="gaia-narrator-wave gaia-narrator-wave-2" />
              <div className="gaia-narrator-wave gaia-narrator-wave-3" />
            </>
          )}
        </div>

        {/* Label */}
        <span className="gaia-narrator-label">
          {muted ? 'GAIA (muted)' : speaking ? 'GAIA habla...' : 'GAIA'}
        </span>
      </div>

      {/* Subtitle bar */}
      <div className={`gaia-subtitle ${showSubtitle && !muted ? 'gaia-subtitle-visible' : ''}`}>
        <div className="gaia-subtitle-inner">
          <span className="gaia-subtitle-icon">✦</span>
          <p className="gaia-subtitle-text">{subtitleText}</p>
        </div>
      </div>
    </>
  );
}
