export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}

export type SpeechCallback = (result: SpeechResult) => void;
export type SpeechErrorCallback = (error: Error) => void;

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

/** Web Speech API 封装，用于识别中文心愿。 */
export class WishSpeech {
  private recognition: SpeechRecognitionLike | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  constructor(
    private onResult: SpeechCallback,
    private onError?: SpeechErrorCallback,
    private onEnd?: () => void,
  ) {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results.item(event.results.length - 1);
      const alternative = result.item(0);
      this.onResult({
        transcript: alternative.transcript,
        isFinal: result.isFinal,
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.onError?.(new Error(`${event.error}${event.message ? `: ${event.message}` : ''}`));
    };

    recognition.onend = () => {
      this.onEnd?.();
    };

    this.recognition = recognition;
  }

  start(): void {
    this.recognition?.start();
  }

  stop(): void {
    try {
      this.recognition?.stop();
    } catch {
      // 已经停止时调用 stop 可能报错，忽略。
    }
  }

  abort(): void {
    try {
      this.recognition?.abort();
    } catch {
      // 忽略。
    }
  }
}

export default WishSpeech;
