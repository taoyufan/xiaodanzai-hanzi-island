import type { CharItem } from '../types';

export function canSpeak(): boolean {
  return 'speechSynthesis' in window;
}

export function speak(text: string, rate = 0.9): void {
  if (!canSpeak()) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = createUtterance(text, rate);
  window.speechSynthesis.speak(utterance);
}

export function speakAndWait(text: string, rate = 0.9): Promise<void> {
  if (!canSpeak()) {
    return Promise.resolve();
  }

  window.speechSynthesis.cancel();
  const utterance = createUtterance(text, rate);
  const fallbackMs = Math.min(8000, Math.max(1800, text.length * 360 + 600));

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      window.clearTimeout(timer);
      resolve();
    };

    const timer = window.setTimeout(finish, fallbackMs);
    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  });
}

function createUtterance(text: string, rate: number): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = rate;
  utterance.pitch = 1.15;
  return utterance;
}

export function speakCharPrompt(item: CharItem): void {
  speak(`请找到这个字：${item.char}。${item.char}，${item.words[0]}的${item.char}`);
}

export function stopSpeak(): void {
  if (canSpeak()) {
    window.speechSynthesis.cancel();
  }
}
