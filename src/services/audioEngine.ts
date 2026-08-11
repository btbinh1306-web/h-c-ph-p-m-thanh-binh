// Web Audio API & Native MP3 Audio Service for Chinese Pinyin Pronunciation

class AudioEngine {
  private ctx: AudioContext | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  private initAudioCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Helper to convert tone marks to tone numbers (e.g. "mā" -> "ma1", "á" -> "a2")
   */
  private convertToneToNumber(str: string): string {
    const toneMap: Record<string, [string, number]> = {
      'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
      'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
      'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
      'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
      'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
      'ǖ': ['v', 1], 'ǘ': ['v', 2], 'ǚ': ['v', 3], 'ǜ': ['v', 4], 'ü': ['v', 0],
    };
    let toneNum = 0;
    let clean = str;
    for (const [char, [replacement, tone]] of Object.entries(toneMap)) {
      if (clean.includes(char)) {
        clean = clean.replace(char, replacement);
        toneNum = tone;
      }
    }
    return toneNum > 0 ? `${clean}${toneNum}` : clean;
  }

  /**
   * Play AI Generated speech for Chinese Pinyin, words, or rule examples
   */
  public async speakPinyin(text: string, rate = 0.9): Promise<void> {
    this.initAudioCtx();
    const cleanText = text.trim();

    // 1. First try AI Web Speech API (SpeechSynthesis) with zh-CN voice
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.synth) {
      try {
        this.synth.cancel(); // Stop any previous speech
        this.loadVoices();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'zh-CN';
        utterance.rate = rate;
        utterance.pitch = 1.0;

        // Find standard Chinese native voice
        const zhVoice =
          this.voices.find(v => v.lang === 'zh-CN' || v.lang === 'zh_CN') ||
          this.voices.find(v => v.lang.startsWith('zh')) ||
          this.voices.find(v => v.name.toLowerCase().includes('chinese'));

        if (zhVoice) {
          utterance.voice = zhVoice;
        }

        return await new Promise<void>((resolve) => {
          let hasResolved = false;

          utterance.onend = () => {
            if (!hasResolved) {
              hasResolved = true;
              resolve();
            }
          };

          utterance.onerror = () => {
            if (!hasResolved) {
              hasResolved = true;
              this.fallbackAudio(cleanText, rate).then(resolve);
            }
          };

          // Safety timeout in case utterance event doesn't fire
          setTimeout(() => {
            if (!hasResolved) {
              hasResolved = true;
              resolve();
            }
          }, 2500);

          this.synth!.speak(utterance);
        });
      } catch {
        // Fallback if speechSynthesis throws
      }
    }

    return this.fallbackAudio(cleanText, rate);
  }

  /**
   * Fallback method using local/remote MP3 or Web Audio API synthesis
   */
  private async fallbackAudio(cleanText: string, rate = 0.9): Promise<void> {
    const lower = cleanText.toLowerCase();
    const basePinyin = lower
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const toneNumberedPinyin = this.convertToneToNumber(lower);

    // Try candidate paths in /audio/
    const candidatePaths = Array.from(new Set([
      `/audio/${lower}.mp3`,
      `/audio/${toneNumberedPinyin}.mp3`,
      `/audio/${basePinyin}.mp3`,
    ]));

    for (const localMp3Url of candidatePaths) {
      if (!localMp3Url.includes('undefined')) {
        try {
          await this.playMp3Url(localMp3Url, rate);
          return;
        } catch {
          // Continue
        }
      }
    }

    // Try online CDN
    const mp3Url = this.getMp3UrlForPinyin(lower);
    if (mp3Url) {
      try {
        await this.playMp3Url(mp3Url, rate);
        return;
      } catch {
        // Continue
      }
    }

    // Acoustic tone generator fallback
    this.playNativePinyinAudio(lower);
  }

  /**
   * Return authentic MP3 URLs for Pinyin phonemes
   */
  private getMp3UrlForPinyin(pinyin: string): string | null {
    // Strip tone marks or clean string to base pinyin
    const basePinyin = pinyin
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '');

    if (!basePinyin) return null;

    // Standard high-reliability Chinese pronunciation audio files
    return `https://yuyan.baidu.com/pinyin/mp3/${basePinyin}.mp3`;
  }

  /**
   * Play MP3 URL directly with speed control and error recovery
   */
  public playMp3Url(url: string, rate = 1.0): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        let audio = this.audioCache.get(url);
        if (!audio || audio.error) {
          audio = new Audio(url);
          // crossOrigin = 'anonymous' MUST ONLY be set on remote HTTP/HTTPS links.
          // Setting it on blob: or data: URLs breaks audio playback in browsers!
          if (url.startsWith('http://') || url.startsWith('https://')) {
            audio.crossOrigin = 'anonymous';
          }
          this.audioCache.set(url, audio);
        }

        try {
          if (audio.readyState > 0) {
            audio.currentTime = 0;
          }
        } catch (e) {
          // ignore seek error on uninitialized audio
        }

        try {
          audio.playbackRate = rate;
        } catch (e) {
          // ignore playbackRate error
        }

        const onEnded = () => {
          cleanup();
          resolve();
        };

        const onError = (e: Event) => {
          cleanup();
          this.audioCache.delete(url);
          reject(e);
        };

        const cleanup = () => {
          audio?.removeEventListener('ended', onEnded);
          audio?.removeEventListener('error', onError);
        };

        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch((err) => {
            cleanup();
            this.audioCache.delete(url);
            reject(err);
          });
        }
      } catch (err) {
        this.audioCache.delete(url);
        reject(err);
      }
    });
  }

  /**
   * Formant & Acoustic Synthesis for Chinese Pinyin (MP3 audio rendering)
   */
  public playNativePinyinAudio(text: string) {
    this.initAudioCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Determine fundamental frequency & formant filter based on Pinyin vowels / consonants
    let freq = 260; // Base frequency ~ C4/D4 range (standard human voice)
    filter.type = 'bandpass';
    filter.Q.value = 3.0;

    const clean = text.toLowerCase();

    if (clean.includes('a') || clean.includes('ā') || clean.includes('á') || clean.includes('ǎ') || clean.includes('à')) {
      freq = 240;
      filter.frequency.setValueAtTime(850, now); // Open front vowel 'a'
    } else if (clean.includes('o') || clean.includes('ō') || clean.includes('ó') || clean.includes('ǒ') || clean.includes('ò')) {
      freq = 220;
      filter.frequency.setValueAtTime(500, now); // Back rounded vowel 'o'
    } else if (clean.includes('e') || clean.includes('ē') || clean.includes('é') || clean.includes('ě') || clean.includes('è')) {
      freq = 250;
      filter.frequency.setValueAtTime(600, now); // Unrounded mid vowel 'e'
    } else if (clean.includes('i') || clean.includes('ī') || clean.includes('í') || clean.includes('ǐ') || clean.includes('ì')) {
      freq = 310;
      filter.frequency.setValueAtTime(2200, now); // High front vowel 'i'
    } else if (clean.includes('u') || clean.includes('ū') || clean.includes('ú') || clean.includes('ǔ') || clean.includes('ù')) {
      freq = 200;
      filter.frequency.setValueAtTime(350, now); // High back rounded 'u'
    } else if (clean.includes('ü') || clean.includes('ǖ') || clean.includes('ǘ') || clean.includes('ǚ') || clean.includes('ǜ')) {
      freq = 290;
      filter.frequency.setValueAtTime(1800, now); // High front rounded 'ü'
    } else if (clean.startsWith('b') || clean.startsWith('p') || clean.startsWith('m') || clean.startsWith('f')) {
      freq = 190;
      filter.frequency.setValueAtTime(450, now); // Labial
    } else if (clean.startsWith('d') || clean.startsWith('t') || clean.startsWith('n') || clean.startsWith('l')) {
      freq = 280;
      filter.frequency.setValueAtTime(1500, now); // Dental
    } else if (clean.startsWith('zh') || clean.startsWith('ch') || clean.startsWith('sh') || clean.startsWith('r')) {
      freq = 230;
      filter.frequency.setValueAtTime(1200, now); // Retroflex
    } else if (clean.startsWith('z') || clean.startsWith('c') || clean.startsWith('s')) {
      freq = 320;
      filter.frequency.setValueAtTime(2800, now); // Dental sibilant
    }

    // Tone contour adjust
    if (text.includes('ā') || text.includes('ō') || text.includes('ē') || text.includes('ī') || text.includes('ū') || text.includes('ǖ')) {
      osc.frequency.setValueAtTime(freq * 1.25, now); // High flat tone 1
    } else if (text.includes('á') || text.includes('ó') || text.includes('é') || text.includes('í') || text.includes('ú') || text.includes('ǘ')) {
      osc.frequency.setValueAtTime(freq * 1.0, now);
      osc.frequency.linearRampToValueAtTime(freq * 1.35, now + 0.35); // Rising tone 2
    } else if (text.includes('ǎ') || text.includes('ǒ') || text.includes('ě') || text.includes('ǐ') || text.includes('ǔ') || text.includes('ǚ')) {
      osc.frequency.setValueAtTime(freq * 1.0, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.8, now + 0.18);
      osc.frequency.linearRampToValueAtTime(freq * 1.2, now + 0.4); // Dipping tone 3
    } else if (text.includes('à') || text.includes('ò') || text.includes('è') || text.includes('ì') || text.includes('ù') || text.includes('ǜ')) {
      osc.frequency.setValueAtTime(freq * 1.35, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.28); // Falling tone 4
    } else {
      osc.frequency.setValueAtTime(freq, now);
    }

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.48);
  }

  /**
   * Sound Effect: Correct answer
   */
  public playCorrectSound() {
    this.initAudioCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5

    osc2.frequency.setValueAtTime(1046.5, now + 0.2); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.2);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }

  /**
   * Sound Effect: Incorrect answer
   */
  public playWrongSound() {
    this.initAudioCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(160, now + 0.3); // Drop

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Sound Effect: Button click feedback
   */
  public playClickSound() {
    this.initAudioCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audioEngine = new AudioEngine();

