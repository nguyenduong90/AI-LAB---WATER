import React from 'react';

// Using a type for the AudioContext ref for better type safety
type AudioContextRef = React.MutableRefObject<AudioContext | null>;

export const useSoundEffects = (audioContextRef: AudioContextRef) => {
  const playSound = (type: 'click' | 'send' | 'receive') => {
    const audioContext = audioContextRef.current;
    // Do not play sound if context is not initialized or running (e.g., before user interaction)
    if (!audioContext || audioContext.state !== 'running') return;

    const now = audioContext.currentTime;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    const oscillator = audioContext.createOscillator();
    oscillator.connect(gainNode);

    if (type === 'click') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } else if (type === 'send') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } else if (type === 'receive') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, now);
      oscillator.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    }
  };

  return {
    playClick: () => playSound('click'),
    playSend: () => playSound('send'),
    playReceive: () => playSound('receive'),
  };
};
