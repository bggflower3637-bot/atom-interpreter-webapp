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
  // 기본 언어 설정 (Korean -> English)
  fromLangSelect.value = "ko-KR";
  toLangSelect.value = "en-US";

  startBtn.addEventListener("click", startDemo);
  stopBtn.addEventListener("click", stopDemo);

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
  rec.lang = fromLangSelect.value || "ko-KR";
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

    // 왼쪽 창: 실시간/최종 음성 텍스트 표시
    const displayText = finalTranscript || interimTranscript || "";
    originalTextArea.value = displayText;

    // 최종 문장이 확정되었을 때만 번역 + 음성 출력
    if (finalTranscript) {
      const translatedWithLabel = fakeTranslate(finalTranscript);

      // 오른쪽 창: 라벨 포함해서 그대로 보여주기
      translatedTextArea.value =
        (translatedTextArea.value ? translatedTextArea.value + "\n" : "") +
        translatedWithLabel;

      // 음성으로 읽어줄 텍스트: [English demo] 같은 라벨 제거
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
// 실제 제품에서는 여기서 OpenAI Realtime / Translation API로 교체
function fakeTranslate(text) {
  const to = toLangSelect.value;

  if (!text || !text.trim()) return "";

  if (to === "en-US") {
    // 영어 데모 라벨
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

  // 이전 발화 중지
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // 목표 언어에 따라 음성 언어 설정
  utterance.lang = toLangSelect.value || "en-US";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

// 상태 메세지 업데이트
function updateStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

// 버튼 상태 업데이트
function toggleControls(listening) {
  startBtn.disabled = listening;
  stopBtn.disabled = !listening;
}

// 초기화 실행
document.addEventListener("DOMContentLoaded", init);


