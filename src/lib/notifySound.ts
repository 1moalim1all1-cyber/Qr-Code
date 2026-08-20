// A short two-tone "new order" chime, synthesized with the Web Audio API —
// no external audio file needed (avoids asset/licensing concerns entirely).
export function playNewOrderChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const now = ctx.currentTime

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration)
    }

    playTone(880, 0, 0.18)
    playTone(1174.66, 0.15, 0.22)
  } catch {
    // Audio can fail silently (autoplay policies, unsupported browser) —
    // the visual toast notification still gets through either way.
  }
}
