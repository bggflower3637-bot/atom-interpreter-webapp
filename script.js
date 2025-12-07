// script.js – Atom Interpreter WebApp v1 (Korean → English 전용)

// ===== 브라우저 TTS (Text → Speech) =====
function speak(text, lang = "en-US") {
  if (!("speechSynthesis" in window)) {
    console.warn("이 브라우저는 SpeechSynthesis(음성 출력)를 지원하지 않습니다.");
    return;
  }
  if (!text || text.trim() === "") return;

  // 이전 재생 중인 음성 정지
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;   // 예: "en-US", "ko-KR"
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.volume = 1.0;

  window.speechSynthesis.speak(utter);
}

// ===== 전역 변수 =====
let recognition = null;
let isListening = false;

// ===== DOM 요소 =====
const inputBox   = document.getElementById("inputText");     // 왼쪽 텍스트 박스
const outputBox  = document.getElementById("outputText");    // 오른쪽 텍스트 박스
const startBtn   = document.getElementById("startBtn");      // 녹음 시작 버튼
const stopBtn    = document.getElementById("stopBtn");       // 녹음 종료 버튼
const translateBtn = document.getElementById("translateBtn");// 텍스트만 번역 버튼(옵션)

// ===== STT(음성 인식) 초기화 – 한국어 전용 =====
function initRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("이 브라우저는 Web Speech API 음성 인식을 지원하지 않습니다. Chrome 사용을 권장합니다.");
    return null;
  }

  const recog = new SpeechRecognition();
  recog.lang = "ko-KR";          // ★ 한국어 고정
  recog.interimResults = true;   // 중간 결과도 받기
  recog.continuous = true;       // 연속 인식

  recog.onstart = () => {
    isListening = true;
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
  };

  recog.onend = () => {
    isListening = false;
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  };

  recog.onerror = (event) => {
    console.error("음성 인식 오류:", event.error);
    isListening = false;
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
  };

  // 인식 결과 처리
  recog.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }

    // 왼쪽 박스에 실시간 표시
    if (inputBox) inputBox.value = transcript;

    // 문장이 확정된(final) 순간에 번역 실행
    const isFinal = event.results[event.results.length - 1].isFinal;
    if (!isFinal) return;

    translateAndSpeak(transcript);
  };

  return recog;
}

// ===== 번역 + 음성 출력 (한국어 → 영어 고정) =====
async function translateAndSpeak(text) {
  if (!text || text.trim() === "") return;

  if (outputBox) outputBox.value = "번역 중입니다... (Translating...)";

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLang: "ko",   // ★ 한국어 입력
        targetLang: "en",   // ★ 영어 출력
      }),
    });

    if (!res.ok) {
      throw new Error("서버 응답 오류: " + res.status);
    }

    const data = await res.json();
    const translated = (data.translatedText || "").trim();

    if (outputBox) outputBox.value = translated;

    // 영어로 음성 출력
    speak(translated, "en-US");
  } catch (err) {
    console.error(err);
    if (outputBox) {
      outputBox.value = "번역 중 오류가 발생했습니다. (브라우저 콘솔을 확인하세요)";
    }
  }
}

// ===== 버튼 이벤트 설정 =====
if (startBtn && stopBtn) {
  startBtn.addEventListener("click", () => {
    if (!recognition) {
      recognition = initRecognition();
      if (!recognition) return;
    }
    if (!isListening) {
      recognition.start();
    }
  });

  stopBtn.addEventListener("click", () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  });
}

// ===== 텍스트 직접 입력 후 번역 버튼 (옵션) =====
if (translateBtn && inputBox) {
  translateBtn.addEventListener("click", () => {
    const text = inputBox.value;
    translateAndSpeak(text);
  });
}

  
