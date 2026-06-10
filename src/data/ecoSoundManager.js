// EcoSync Web Audio API Soundscape & SFX Synthesis Engine

class EcoSoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientAudio = null;
    
    this.volumeLevel = 'muted'; // 'muted' | 'medium'
    this.initialized = false;
  }

  // Initialize nodes only after user interaction to bypass browser Autoplay policy
  ensureInitialized() {
    if (this.initialized) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn("Web Audio API not supported in this browser.");
        return;
      }

      this.ctx = new AudioContextClass();
      
      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime); // Start silent
      this.masterGain.connect(this.ctx.destination);

      // SFX Node (clicks, chimes)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Load natural birds ambient audio stream (replaces creepy white noise synth)
      this.ambientAudio = new Audio('/nature-ambient.mp3');
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = 0.45;
      
      this.initialized = true;
      this.applyVolumeLevel();

      console.log("EcoSoundManager successfully initialized with natural audio.");
    } catch (error) {
      console.error("Failed to initialize EcoSoundManager:", error);
    }
  }

  // Set visual carbon state (reserved for future state adjustments of ambient sound if needed)
  setCarbonState(state) {
    // Left as stub since we are using natural audio loop instead of active filter modulation
  }

  // Set volume setting (muted, medium)
  setVolume(level) {
    this.volumeLevel = level;
    
    if (!this.initialized && level !== 'muted') {
      this.ensureInitialized();
    }

    if (this.initialized) {
      // Resume context if suspended
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.applyVolumeLevel();
    }
  }

  applyVolumeLevel() {
    if (!this.masterGain || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    if (this.volumeLevel === 'muted') {
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.1);
      if (this.ambientAudio) {
        this.ambientAudio.pause();
      }
    } else {
      // Play nature soundscape
      this.masterGain.gain.linearRampToValueAtTime(0.7, now + 0.15);
      if (this.ambientAudio) {
        this.ambientAudio.play().catch(e => console.warn("Audio autoplay blocked by browser policy:", e));
      }
    }
  }

  // --- INTERFACE SFX SYNTHESIS ---

  // Tactile woodblock/click sound
  playClick() {
    this.ensureInitialized();
    if (!this.initialized || !this.ctx || this.volumeLevel === 'muted') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Ascending pentatonic chime (Log habit)
  playChime() {
    this.ensureInitialized();
    if (!this.initialized || !this.ctx || this.volumeLevel === 'muted') return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 587.33, 698.46, 783.99];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);

      gainNode.gain.setValueAtTime(0, now + idx * 0.065);
      gainNode.gain.linearRampToValueAtTime(0.06, now + idx * 0.065 + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.065 + 0.4);

      osc.connect(gainNode);
      gainNode.connect(this.sfxGain);

      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.45);
    });
  }

  // Descending flat sweep (Delete log)
  playDelete() {
    this.ensureInitialized();
    if (!this.initialized || !this.ctx || this.volumeLevel === 'muted') return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(130, now + 0.18);

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.linearRampToValueAtTime(0.04, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Glittering chime arpeggio cascade (Level Up!)
  playLevelUp() {
    this.ensureInitialized();
    if (!this.initialized || !this.ctx || this.volumeLevel === 'muted') return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      gainNode.gain.setValueAtTime(0, now + idx * 0.045);
      gainNode.gain.linearRampToValueAtTime(0.05, now + idx * 0.045 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.45);

      osc.connect(gainNode);
      gainNode.connect(this.sfxGain);

      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.5);
    });
  }
}

const soundManagerInstance = new EcoSoundManager();
export default soundManagerInstance;
