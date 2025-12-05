// script.js – 아주 단순한 데모 버전
// 기능:
// 1) 브라우저 Web Speech API로 음성 인식
// 2) 왼쪽 박스에 실시간 인식된 텍스트 표시
// 3) 오른쪽 박스에는 [English demo] + 같은 문장 표시
// 4) 인식이 끝나면 오른쪽 문장을 선택된 언어로 읽어줌 (TTS)

// ===== 브라우저 TTS (Text → Speech) 함수 =====
function speak(text, lang = "en-US") {
  if (!("speechSynthesis" in window)) {
    console.warn("이 브라우저는 SpeechSynthesis(음성 출력)를 지원하지 않습니다.");
    return;
  }

  if (!text || text.trim() === "") return;

  // 이전에 재생 중이던 음성 정지
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang; // 예: "en-US", "ko-KR" 등

  // (선택) 속도/피치/볼륨 조절
  utterance.rate = 1.0;   // 말 속도 (0.1 ~ 10)
  utterance.pitch = 1.0;  // 톤 (0 ~ 2)
  utterance.volume = 1.0; // 볼륨 (0 ~ 1)

  window.speechSynthesis.speak(utterance);
}

// 번역 대상 언어 라벨 → TTS 언어 코드 매핑
function getTtsLangCode(langLabel) {
  const map = {
    "English": "en-US",
    "Korean": "ko-KR",
    "Japanese": "ja-JP",
    "Spanish": "es-ES",
    "Chinese": "zh-CN"
  };
  return map[langLabel] || "en-US";
}

// 데모용 번역 함수 (진짜 번역이 아니라 화면용만)
function makeDemoTranslation(text, fromLang, toLang) {
  if (!text || text.trim() === "") return "";

  // 예시: 한국어 → 영어이고, "안녕"이 들어가면 "Hello"라고 번역
  if (fromLang === "Korean" && toLang === "English") {
    if (text.includes("안녕")) {
      return "Hello";
    }
  }

  // 그 외에는 단순 데모 문구
  return `[demo 번역: ${toLang}] ${text}`;
}

window.addEventListener("DOMContentLoaded", () => {
  const fromSelect    = document.getElementById("from-lang");    // 언어 From
  const toSelect      = document.getElementById("to-lang");      // 언어 To
  const startBtn      = document.getElementById("start-btn");    // Start Demo 버튼
  const stopBtn       = document.getElementById("stop-btn");     // Stop 버튼
  const originalBox   = document.getElementById("original-text");// 왼쪽 텍스트박스
  const translatedBox = document.getElementById("translated-text");// 오른쪽 텍스트박스

  let recognition = null;
  let recognizing = false;

  function updateUi() {
    if (recognizing) {
      startBtn.disabled = true;
      stopBtn.disabled  = false;
    } else {
      startBtn.disabled = false;
      stopBtn.disabled  = true;
    }
  }

  function createRecognition() {
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      console.warn("이 브라우저는 Web Speech API(음성 인식)를 지원하지 않습니다.");
      return null;
    }

    const rec = new SpeechRec();
    rec.lang = fromSelect.value === "Korean"
      ? "ko-KR"
      : fromSelect.value === "English"
      ? "en-US"
      : "ko-KR";

    rec.interimResults = false;
    rec.continuous = true;

    rec.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript.trim();

      // 왼쪽 박스에 인식된 원문 표시
      originalBox.value = transcript;

      // 데모 번역 텍스트 생성
      const demoTranslated = makeDemoTranslation(
        transcript,
        fromSelect.value,
        toSelect.value
      );

      // 오른쪽 박스에 번역 표시
      translatedBox.value = demoTranslated;

      // 번역된 문장을 선택된 언어로 읽어주기
      const ttsLang = getTtsLangCode(toSelect.value);
      speak(demoTranslated, ttsLang);
    };

    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      recognizing = false;
      updateUi();
    };

    rec.onend = () => {
      recognizing = false;
      updateUi();
    };

    return rec;
  }

  startBtn.addEventListener("click", () => {
    if (!recognition) {
      recognition = createRecognition();
    }
    if (!recognition) return;

    recognizing = true;
    updateUi();
    recognition.start();
  });

  stopBtn.addEventListener("click", () => {
    if (recognition) {
      recognition.stop();
    }
    recognizing = false;
    updateUi();
  });

  // 초기 버튼 상태
  updateUi();
});

