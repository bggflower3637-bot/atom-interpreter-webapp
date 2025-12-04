// script.js
// Atom Interpreter – 브라우저 음성 인식 + 데모 번역 + 음성 출력

// ==== DOM 요소 참조 ====
const fromLangSelect = document.getElementById("fromLang");
const toLangSelect = document.getElementById("toLang");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("statusText");
const statusIndicator = document.getElementById("statusIndicator");
const originalTextArea = document.getElementById("originalText");
const translatedTextArea = document.getElementById("translatedText");

// ==== 상태 ====
let recognition = null;
let recognizing = false;

// ==== 유틸: 상태 표시 ====
function setStatus(text, mode = "idle") {
  statusText.textContent = text;

  if (!statusIndicator) return;
  statusIndicator.className = "status-indicator";

  if (mode === "listening") {
    statusIndicator.classList.add("listening");
  } else if (mode === "error") {
    statusIndicator.classList.add("error");
  } else if (mode === "speaking") {
    statusIndicator.classList.add("speaking");
  }
}

function updateButtons() {
  if (recognizing) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

// ==== 번역 데모 함수 (진짜 번역 대신 prefix만 바꿔주는 버전) ====
function fakeTranslate(text) {
  const to = toLangSelect.value;

  if (!text || !text.trim()) return "";

  if (to === "en-US") {
    return "[English demo] " + text;
  }
  if (to === "ko-KR") {
    return "[Korean demo] " + text;
  }
  if (to === "es-ES") {
    return "[Spanish demo] " + text;
  }
  if (to === "ja-JP") {
    return "[Japanese demo] " + text;
  }
  return "[Demo] " + text;
}

// ==== TTS(음성 출력) ====
function speakText(text) {
  if (!window.speechSynthesis) {
    setStatus("이 브라우저는 음성 출력을 지원하지 않습니다.", "error");
    return;
  }

  if (!text || !text.trim()) return;

  const utterance = new SpeechSynthesisUtterance(text);

  // 번역된 언어에 맞춰 음성 언어 설정
  utterance.lang = toLangSelect.value || "en-US";

  utterance.onstart = () => {
    setStatus("Playing translated speech…", "speaking");
  };

  utterance.onend = () => {
    if (recognizing) {
      setStatus("Listening… you can keep speaking.", "listening");
    } else {
      setStatus("Stopped.", "idle");
    }
  };

  window.speechSynthesis.cancel(); // 이전 재생 중단
  window.speechSynthesis.speak(utterance);
}

// ==== SpeechRecognition 초기화 ====
function createRecognitionInstance() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setStatus(
      "이 브라우저는 음성 인식을 지원하지 않습니다. 데스크톱 Chrome 브라우저에서 사용해주세요.",
      "error"
    );
    alert(
      "현재 브라우저에서는 음성 인식이 지원되지 않습니다.\n데스크톱 Chrome 브라우저에서 열어주세요."
    );
    return null;
  }

  const recog = new SpeechRecognition();
  recog.lang = fromLangSelect.value || "ko-KR";
  recog.interimResults = true;
  recog.continuous = true;

  recog.onstart = () => {
    recognizing = true;
    updateButtons();
    setStatus("Listening… you can speak now. 🎤", "listening");
    console.log("SpeechRecognition started");
  };

  recog.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // 원문 텍스트 영역 업데이트
    const combined =
      (originalTextArea.value ? originalTextArea.value + " " : "") +
      (finalTranscript || interimTranscript);
    originalTextArea.value = combined.trim();

       // 최종 인식 결과가 확정된 경우 번역 + 음성 출력
    if (finalTranscript) {
      const translated = fakeTranslate(finalTranscript);

      // 1) 화면에 보여줄 텍스트는 라벨까지 그대로
      translatedTextArea.value =
        (translatedTextArea.value
          ? translatedTextArea.value + "\n"
          : "") + translated;

      // 2) 소리로 읽어줄 텍스트에서는 [English demo] 같은 라벨 제거
      const speechText = translated.replace(/^\[[^\]]*\]\s*/, "");
      speakText(speechText);
    }

  };

  recog.onerror = (event) => {
    console.error("SpeechRecognition error:", event.error);
    recognizing = false;
    updateButtons();
    setStatus("음성 인식 에러: " + event.error, "error");
  };

  recog.onend = () => {
    console.log("SpeechRecognition ended");
    recognizing = false;
    updateButtons();
    // 사용자가 Stop을 눌러서 끝난 건지,
    // 브라우저에서 자동으로 끊긴 건지 상관없이 메시지 표시
    setStatus("Stopped. Click “Start Demo” to listen again.", "idle");
  };

  return recog;
}

// ==== 이벤트 핸들러: Start / Stop ====
startBtn.addEventListener("click", () => {
  if (recognizing) return;

  // 기존 TTS 중단
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  if (!recognition) {
    recognition = createRecognitionInstance();
    if (!recognition) return; // 브라우저 지원 안 하면 null
  }

  // 현재 선택된 언어로 갱신
  recognition.lang = fromLangSelect.value || "ko-KR";

  try {
    recognition.start();
  } catch (err) {
    // 이미 start 상태일 때 또 start 호출하면 에러가 나는데, 무시해도 됨
    console.warn("Recognition start error:", err);
  }
});

stopBtn.addEventListener("click", () => {
  if (!recognition) return;
  recognizing = false;
  updateButtons();

  try {
    recognition.stop();
  } catch (err) {
    console.warn("Recognition stop error:", err);
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  setStatus("Stopped.", "idle");
});

// 초기 상태
setStatus('Idle – click "Start Demo" to begin.', "idle");
updateButtons();


