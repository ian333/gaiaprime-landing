import { useState, useCallback } from 'react';
import { TrialModal } from './components/TrialModal';
import { GaiaCinema } from './components/GaiaCinema';
import { GaiaExperience } from './components/GaiaExperience';
import { useGaiaAudio } from './hooks/useGaiaAudio';

/* ══════════════════════════════════════════════════════════════
   GAIA Prime — Cinematic Experience
   gaiaprime.com.mx
   
   Flow: Cinema Intro → Full-screen guided tour
   ══════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════
// ── Main App ──
// ══════════════════════════════════════
export default function App() {
  const [trialOpen, setTrialOpen] = useState(false);
  const [cinemaComplete, setCinemaComplete] = useState(false);
  const gaiaAudio = useGaiaAudio();

  const openTrial = useCallback(() => setTrialOpen(true), []);

  return (
    <div className="relative min-h-screen bg-[#050508]">
      {/* Cinematic Intro */}
      {!cinemaComplete && (
        <GaiaCinema
          onComplete={() => setCinemaComplete(true)}
          gaiaAudio={gaiaAudio}
        />
      )}

      {/* Full-screen Guided Experience */}
      {cinemaComplete && (
        <GaiaExperience
          gaiaAudio={gaiaAudio}
          onStartTrial={openTrial}
        />
      )}

      {/* Trial Signup Modal */}
      <TrialModal isOpen={trialOpen} onClose={() => setTrialOpen(false)} />
    </div>
  );
}
