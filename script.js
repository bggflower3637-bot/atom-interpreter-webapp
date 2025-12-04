// =========================
// Atom Interpreter Demo - script.js (with TTS)
// =========================

// 작은 헬퍼: 여러 후보 ID 중에서 먼저 발견되는 요소를 반환
function byId(...ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

// DOM 요소 참조
const fromSelect = byId('fromLang', 'from-language');
const toSelect = byId('toLang', 'to-language');
const startBtn = byId('startDemo', 'start-demo');
const stopBtn = byId('stopDemo', 'stop-demo');
const originalBox = byId('originalSpeech', 'original-speech');
const translatedBox = byId('translatedSpeech', 'translated-speech');
const statusEl = byId('statusText', 'status-text');

// =========================
// Browser TTS (Text-To-Speech)
// =========================
let isSpeakingEnabled = false;

function getLangCodeForSpeech(targetValue) {
  // targetValue: 셀렉트 박스의 value 또는 label 텍스트
  if (!targetValue) return 'en-US';

  const v = String(targetValue).toLowerCase();

  if (v.includes('korean') || v === 'ko' || v === 'ko-kr') return 'ko-KR';
  if (v.includes('japanese') || v === 'ja' || v === 'ja-jp') return 'ja-JP';
  if (v.includes('spanish') || v === 'es' || v === 'es-es') return 'es-ES';
  if (v.includes('chinese') || v === 'zh' || v === 'zh-cn') return 'zh-CN';
  if (v.includes('french') || v === 'fr' || v === 'fr-fr') return 'fr-FR';

  // 기본값: 영어
  return 'en-US';
}

function speakText(text, targetValue) {
  if (!isSpeakingEnabled) return;
  if (!text || !text.trim()) return;

  if (!('speechSynthesis' in window)) {
    console.warn('speechSynthesis (TTS)를 지원하지 않는 브라우저입니다.');
    return;
  }

  const langCode = getLangCodeForSpeech(targetValue);
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langCode;

  // 이전에 말하던 것 중지 후 새로 재생
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

// =========================
// Speech Recognition (브라우저 데모용 STT)
// =========================

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

function getLangCodeForRecognition(fromValue) {
  if (!fromValue) return 'ko-KR';

  const v = String(fromValue).toLowerCase();

  if (v.includes('korean') || v === 'ko' || v === 'ko-kr') return 'ko-KR';
  if (v.includes('japanese') || v === 'ja' || v === 'ja-jp') return 'ja-JP';
  if (v.includes('spanish') || v === 'es' || v === 'es-es') return 'es-ES';
  if (v.includes('chinese') || v === 'zh' || v === 'zh-cn') return 'zh-CN';
  if (v.includes('french') || v === 'fr' || v === 'fr-fr') return 'fr-FR';

  // 기본값: 영어
  return 'en-US';
}

function initRecognition() {
  if (!SpeechRecognition) {
    console.warn('이 브라우저는 Web Speech Recognition API를 지원하지 않습니다.');
    if (statusEl) {
      statusEl.textContent =
        '⚠️ 이 브라우저에서는 음성 인식을 사용할 수 없습니다. (Chrome 데스크톱 추천)';
    }
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  const fromValue =
    (fromSelect && (fromSelect.value || fromSelect.options[fromSelect.selectedIndex]?.text)) ||
    'Korean';
  recognition.lang = getLangCodeForRecognition(fromValue);

  recognition.onstart = () => {
    isListening = true;
    if (statusEl) statusEl.textContent = 'Listening... you can speak now.';
  };

  recognition.onend = () => {
    isListening = false;
    if (statusEl) statusEl.textContent = 'Stopped. Click "Start Demo" to listen again.';
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (statusEl) statusEl.textContent = 'Error: ' + event.error;
  };

  recognition.onresult = (event) => {
    // 가장 마지막 결과 사용
    const lastResult = event.results[event.results.length - 1];
    if (!lastResult) return;

    const transcript = lastResult[0].transcript.trim();
    if (!transcript) return;

    if (originalBox) originalBox.value = transcript;

    // 데모용 "번역" 문자열 생성
    const toLabel =
      (toSelect && (toSelect.value || toSelect.options[toSelect.selectedIndex]?.text)) ||
      'English';

    const translated = `[${toLabel} demo] ` + transcript;

    if (translatedBox) translatedBox.value = translated;

    // 브라우저 TTS로 읽어주기
    speakText(translated, toLabel);
  };
}

// =========================
// UI 이벤트 바인딩
// =========================

function updateRecognitionLanguage() {
  if (!recognition || !fromSelect) return;
  const fromValue =
    fromSelect.value || fromSelect.options[fromSelect.selectedIndex]?.text;
  recognition.lang = getLangCodeForRecognition(fromValue);
}

function handleStart() {
  if (!SpeechRecognition) {
    alert('이 브라우저에서는 음성 인식을 사용할 수 없습니다. (Chrome 데스크톱 추천)');
    return;
  }

  if (!recognition) {
    initRecognition();
  }

  updateRecognitionLanguage();
  isSpeakingEnabled = true;

  try {
    recognition.start();
  } catch (e) {
    // 이미 실행 중이면 start()에서 에러가 날 수 있음 → 무시
    console.warn('Recognition start error (may already be running):', e);
  }

  if (statusEl) {
    statusEl.textContent =
      'Listening... you can speak now. This is a browser demo of Atom Interpreter.';
  }
}

function handleStop() {
  isSpeakingEnabled = false;

  if (recognition && isListening) {
    recognition.stop();
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (statusEl) statusEl.textContent = 'Stopped.';
}

// From 언어 변경 시 recognition.lang 업데이트
if (fromSelect) {
  fromSelect.addEventListener('change', () => {
    updateRecognitionLanguage();
  });
}

// Start / Stop 버튼 연결
if (startBtn) {
  startBtn.addEventListener('click', handleStart);
}

if (stopBtn) {
  stopBtn.addEventListener('click', handleStop);
}

// 페이지 로드 시 한 번 초기화
document.addEventListener('DOMContentLoaded', () => {
  if (SpeechRecognition) {
    initRecognition();
  } else if (statusEl) {
    statusEl.textContent =
      '⚠️ 브라우저가 음성 인식을 지원하지 않습니다. (Chrome 데스크톱 추천)';
  }
});


