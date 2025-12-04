// Atom Interpreter – demo frontend using browser SpeechRecognition.
// 실제 상용 버전에서는 여기에서 OpenAI / Atom Interpreter 백엔드와 연결하면 됩니다.

let recognition = null;
let isListening = false;

const overlay = document.getElementById("overlay");
const overlayStartBtn = document.getElementById("overlayStartBtn");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const originalTextEl = document.getElementById("originalText");
const translatedTextEl = document.getElementById("translatedText");
const sourceLangSelect = document.getElementById("sourceLang");
const targetLangSelect = document.getElementById("targetLang");

// ---------- INIT SPEECH RECOGNITION ----------

function createRecognition(lang) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusDot.classList.add("error");
    statusText.textContent =
      "SpeechRecognition is not supported in this browser. Use Chrome or Edge.";
    return null;
  }

  const rec = new SpeechRecognition();
  rec.lang = lang || "en-US";
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  return rec;
}

// ---------- UI HELPERS ----------

function setStatus(mode, message) {
  statusDot.classList.remove("listening", "error");
  if (mode === "listening") {
    statusDot.classList.add("listening");
  } else if (mode === "error") {
    statusDot.classList.add("error");
  }
  statusText.textContent = message;
}

function resetTexts() {
  originalTextEl.textContent = "Say something after starting the demo…";
  originalTextEl.classList.add("placeholder");
  translatedTextEl.textContent =
    "Your AI translation will appear here in real time.";
  translatedTextEl.classList.add("placeholder");
}

// ---------- DEMO "TRANSLATION" ----------

// 여기에서 실제 Atom Interpreter 백엔드 호출로 교체하면 된다.
// 현재는 데모용으로 간단한 변환 텍스트만 보여준다.
function fakeTranslate(text, targetLang) {
  if (!text.trim()) return "";
  return `[${targetLang.toUpperCase()} demo] ` + text;
}

// ---------- START / STOP LOGIC ----------

function startListening() {
  if (isListening) return;

  // 언어 설정에 맞게 새 인스턴스 생성
  recognition = createRecognition(sourceLangSelect.value);
  if (!recognition) return;

  isListening = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  originalTextEl.classList.remove("placeholder");
  translatedTextEl.classList.remove("placeholder");

  let finalTranscript = "";

  recognition.onstart = () => {
    setStatus(
      "listening",
      "Listening… you can speak now. This is a browser demo of Atom Interpreter."
    );
  };

  recognition.onerror = (event) => {
    console.error("recognition error", event);
    setStatus("error", "Microphone error. Please check permission and try again.");
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recognition.onend = () => {
    // 사용자가 Stop을 누른 경우가 아니라면 자동 재시작 시도
    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.warn("restart error", e);
      }
    } else {
      setStatus("idle", "Stopped. Click “Start Demo” to listen again.");
    }
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    const combined = (finalTranscript + " " + interimTranscript).trim();
    originalTextEl.textContent = combined || "Listening…";

    // 데모 번역 결과
    const targetCode = targetLangSelect.value || "ko";
    translatedTextEl.textContent = fakeTranslate(combined, targetCode);
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("start error", e);
    setStatus("error", "Unable to start microphone. Please try again.");
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
}

function stopListening() {
  if (!isListening) return;
  isListening = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;

  try {
    recognition && recognition.stop();
  } catch (e) {
    console.warn("stop error", e);
  }
  setStatus("idle", "Stopped. Click “Start Demo” to listen again.");
}

// ---------- EVENT BINDINGS ----------

overlayStartBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  // 사용자가 한 번 클릭했으니 여기서 바로 시작
  startListening();
});

startBtn.addEventListener("click", () => {
  startListening();
});

stopBtn.addEventListener("click", () => {
  stopListening();
});

window.addEventListener("load", () => {
  resetTexts();

  // 브라우저 정책상 완전 자동 마이크 ON은 불가능.
  // 대신 초기에 오버레이를 보여주고, 사용자가 한 번만 클릭하면 바로 시작되게 설계.
  setStatus(
    "idle",
    "Ready. Click “마이크 허용하고 시작하기” 또는 “Start Demo” to begin."
  );
});
