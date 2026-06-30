let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) {
    return null;
  }
  if (!audioContext) {
    audioContext = new AudioCtor();
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

function tone(frequency: number, start: number, duration: number, volume = 0.16): void {
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + start);
  gain.gain.setValueAtTime(0, ctx.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + start);
  oscillator.stop(ctx.currentTime + start + duration + 0.03);
}

export function playCorrectSound(): void {
  tone(523.25, 0, 0.12);
  tone(659.25, 0.1, 0.12);
  tone(783.99, 0.2, 0.16);
}

export function playWrongSound(): void {
  tone(246.94, 0, 0.18, 0.09);
  tone(220, 0.16, 0.2, 0.08);
}

export function playCoinSound(): void {
  tone(880, 0, 0.08, 0.12);
  tone(1174.66, 0.08, 0.1, 0.12);
}

export function playWinSound(): void {
  tone(523.25, 0, 0.12);
  tone(659.25, 0.12, 0.12);
  tone(783.99, 0.24, 0.12);
  tone(1046.5, 0.36, 0.22);
}
