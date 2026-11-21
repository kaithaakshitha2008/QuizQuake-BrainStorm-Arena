import { useState, useCallback } from 'react';

export function useAudioFx() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('quizquake_sound') !== 'false';
  });

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('quizquake_sound', String(next));
      return next;
    });
  };

  const playTone = useCallback((frequencies: number[], type: OscillatorType = 'sine', duration = 0.15, interval = 0.08) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * interval);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * interval);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * interval + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * interval);
        osc.stop(ctx.currentTime + idx * interval + duration);
      });
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  const playCorrect = useCallback(() => {
    // Joyful major chord chime: C5, E5, G5
    playTone([523.25, 659.25, 783.99], 'sine', 0.2, 0.07);
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    // Low thud: D3, C#3
    playTone([146.83, 138.59], 'triangle', 0.25, 0.09);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    // Level up fanfare: G4, C5, E5, G5
    playTone([392.00, 523.25, 659.25, 783.99], 'sine', 0.3, 0.08);
  }, [playTone]);

  const playLevelDown = useCallback(() => {
    // Level down descending: G4, E4, C4
    playTone([392.00, 329.63, 261.63], 'sine', 0.25, 0.08);
  }, [playTone]);

  return {
    soundEnabled,
    toggleSound,
    playCorrect,
    playIncorrect,
    playLevelUp,
    playLevelDown,
  };
}
