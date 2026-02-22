import { useState, useEffect, useCallback } from 'react';

interface GaiaCinemaProps {
  onComplete: () => void;
  gaiaAudio: {
    play: (id: string) => Promise<void>;
    enable: () => void;
    preloadMany: (ids: string[]) => void;
    enabled: boolean;
    manifest: unknown | null;
  };
}

/**
 * GaiaCinema — Cinematic intro experience
 * 
 * Timeline:
 * 0s      → Black screen, GAIA orb pulses
 * click   → User enables audio + starts experience
 * 0-2s    → "Hola." typewriter + audio
 * 2-4s    → "Soy GAIA." typewriter + audio
 * 4-10s   → Full intro line + dashboard explosion
 * 10s     → Transition out, landing revealed
 */
export function GaiaCinema({ onComplete, gaiaAudio }: GaiaCinemaProps) {
  const [phase, setPhase] = useState<'waiting' | 'hola' | 'soy_gaia' | 'intro' | 'explode' | 'done'>('waiting');
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [showOrb, setShowOrb] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number; delay: number }>>([]);

  // Cursor blink
  useEffect(() => {
    const i = setInterval(() => setShowCursor(p => !p), 530);
    return () => clearInterval(i);
  }, []);

  // Preload audio clips
  useEffect(() => {
    gaiaAudio.preloadMany(['intro_hola', 'intro_soy_gaia', 'intro_completa']);
  }, [gaiaAudio]);

  // Generate explosion particles
  useEffect(() => {
    if (phase === 'explode') {
      const pts = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 10,
        y: 50 + (Math.random() - 0.5) * 10,
        angle: (i / 40) * 360 + Math.random() * 20,
        delay: Math.random() * 0.3,
      }));
      setParticles(pts);
    }
  }, [phase]);

  // Typewriter effect
  const typewrite = useCallback((fullText: string, speed = 60): Promise<void> => {
    return new Promise(resolve => {
      let i = 0;
      setText('');
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }, []);

  // Start the cinematic sequence
  const startExperience = useCallback(async () => {
    gaiaAudio.enable();

    // Wait for manifest to be loaded (max 3s)
    let waitMs = 0;
    while (!gaiaAudio.manifest && waitMs < 3000) {
      await new Promise(r => setTimeout(r, 100));
      waitMs += 100;
    }
    // Small extra delay to ensure enable() has fully propagated
    await new Promise(r => setTimeout(r, 200));

    // Phase 1: "Hola."
    setPhase('hola');
    await Promise.all([
      typewrite('Hola.', 80),
      gaiaAudio.play('intro_hola'),
    ]);
    await new Promise(r => setTimeout(r, 400));

    // Phase 2: "Soy GAIA."
    setPhase('soy_gaia');
    setText('');
    await Promise.all([
      typewrite('Soy GAIA.', 70),
      gaiaAudio.play('intro_soy_gaia'),
    ]);
    await new Promise(r => setTimeout(r, 500));

    // Phase 3: Full intro
    setPhase('intro');
    setText('');
    await Promise.all([
      typewrite('Y voy a cambiar la forma en que manejas tu negocio.', 45),
      gaiaAudio.play('intro_completa'),
    ]);
    await new Promise(r => setTimeout(r, 800));

    // Phase 4: Explosion
    setPhase('explode');
    setShowOrb(false);
    await new Promise(r => setTimeout(r, 1500));

    // Phase 5: Done
    setPhase('done');
    await new Promise(r => setTimeout(r, 600));
    onComplete();
  }, [gaiaAudio, onComplete, typewrite]);

  // Skip
  const handleSkip = useCallback(() => {
    gaiaAudio.enable();
    setPhase('done');
    onComplete();
  }, [gaiaAudio, onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`cinema-overlay ${phase === 'explode' ? 'cinema-fade-out' : ''}`}
      onClick={phase === 'waiting' ? startExperience : undefined}
    >
      {/* Ambient particles */}
      <div className="cinema-ambient">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="cinema-ambient-dot"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* GAIA Orb */}
      {showOrb && (
        <div className={`cinema-orb ${phase === 'waiting' ? 'cinema-orb-breathe' : 'cinema-orb-active'}`}>
          <div className="cinema-orb-core" />
          <div className="cinema-orb-ring cinema-orb-ring-1" />
          <div className="cinema-orb-ring cinema-orb-ring-2" />
          <div className="cinema-orb-ring cinema-orb-ring-3" />
        </div>
      )}

      {/* Explosion particles */}
      {phase === 'explode' && particles.map(p => (
        <div
          key={p.id}
          className="cinema-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            '--angle': `${p.angle}deg`,
            '--delay': `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}

      {/* Text */}
      <div className="cinema-text-container">
        {phase === 'waiting' ? (
          <div className="cinema-start-prompt">
            <div className="cinema-start-icon">✦</div>
            <p className="cinema-start-text">Toca para iniciar la experiencia</p>
            <p className="cinema-start-sub">🔊 Enciende tu sonido</p>
          </div>
        ) : (
          <div className="cinema-typewriter">
            <span className={`cinema-typed ${phase === 'hola' ? 'cinema-text-glow' : ''} ${phase === 'soy_gaia' ? 'cinema-text-gaia' : ''} ${phase === 'intro' ? 'cinema-text-intro' : ''}`}>
              {text}
            </span>
            <span className={`cinema-cursor ${showCursor ? 'opacity-100' : 'opacity-0'}`}>|</span>
          </div>
        )}
      </div>

      {/* Skip button */}
      {phase !== 'waiting' && phase !== 'explode' && (
        <button className="cinema-skip" onClick={handleSkip}>
          Saltar →
        </button>
      )}
    </div>
  );
}
