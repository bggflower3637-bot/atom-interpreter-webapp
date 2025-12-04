// Atom Interpreter demo script
// 브라우저 내장 STT + TTS를 사용한 데모 버전입니다.

let recognition = null;
let isListening = false;

// DOM 요소들
const fromLangSelect = document.getElementById("from-lang");
const toLangSelect = document.getElementById("to-lang");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const originalTextArea = document.getElementById("original-text");
const translatedTextArea = document.getElementById("translated-text");
const statusText = document.getElementById("status-text");

// 초기 설정
function init() {
  // 기본 언어 (Korean -> English)
  if (fromLangSelect) fromLangSelect.value = "ko-KR";
  if (toLangSelect) toLangSelect.value = "en-US";

  if (startBtn) startBtn.addEventListener("click", startDemo);
  if (stopBtn) stopBtn.addEventListener("click", stopDemo);

  updateStatus('Idle – click "Start Demo" to begin.');
  toggleControls(false);
}

// STT 인식기 세팅
function setupRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("이 브라우저에서는 음성 인식이 지원되지 않습니다. Chrome을 사용해 주세요.");
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = (fromLangSelect && fromLangSelect.value) || "ko-KR";
  rec.interimResults = true;
  rec.continuous = true;

  rec.onstart = () => {
    isListening = true;
    updateStatus("Listening… you can keep speaking.");
    toggleControls(true);
  };

  rec.onerror = (event) => {
    console.error("Recognition error:", event.error);
    updateStatus("Error occurred: " + event.error);
    isListening = false;
    toggleControls(false);
  };

  rec.onend = () => {
    isListening = false;
    updateStatus('Stopped. Click "Start Demo" to listen again.');
    toggleControls(false);
  };

  rec.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    const displayText = finalTranscript || interimTranscript || "";
    if (originalTextArea) originalTextArea.value = displayText;

    if (finalTranscript) {
      const translatedWithLabel = fakeTranslate(finalTranscript);

      if (translatedTextArea) {
        translatedTextArea.value =
          (translatedTextArea.value ? translatedTextArea.value + "\n" : "") +
          translatedWithLabel;
      }

      const speechText = translatedWithLabel.replace(/^\[[^\]]*\]\s*/, "");
      speakText(speechText);
    }
  };

  return rec;
}

// 데모 시작
function startDemo() {
  if (isListening) return;

  recognition = setupRecognition();
  if (!recognition) return;

  try {
    updateStatus("Requesting microphone permission…");
    recognition.start();
  } catch (err) {
    console.error("start error:", err);
    updateStatus("Could not start recognition: " + err.message);
  }
}

// 데모 중지
function stopDemo() {
  if (!recognition || !isListening) return;

  recognition.stop();
  isListening = false;
  updateStatus('Stopped. Click "Start Demo" to listen again.');
  toggleControls(false);
}

// 가짜 번역 함수 (데모용)
function fakeTranslate(text) {
  const to = (toLangSelect && toLangSelect.value) || "en-US";
  if (!text || !text.trim()) return "";

  if (to === "en-US") {
    return "[English demo] " + text;
  } else if (to === "ko-KR") {
    return "[Korean demo] " + text;
  }
  return "[Demo] " + text;
}

// 브라우저 TTS로 문장 읽기
function speakText(text) {
  if (!text || !text.trim()) return;

  if (!("speechSynthesis" in window)) {
    console.warn("이 브라우저에서는 음성 합성이 지원되지 않습니다.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = (toLangSelect && toLangSelect.value) || "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

// 상태 메세지
function updateStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

// 버튼 상태
function toggleControls(listening) {
  if (startBtn) startBtn.disabled = listening;
  if (stopBtn) stopBtn.disabled = !listening;
}

// 초기화 실행
document.addEventListener("DOMContentLoaded", init);

