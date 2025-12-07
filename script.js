// script.js – Atom Interpreter WebApp v1

// ===== 브라우저 TTS (Text → Speech) =====
function speak(text, lang = "en-US") {
  if (!("speechSynthesis" in window)) {
    console.warn("이 브라우저는 SpeechSynthesis(음성 출력)를 지원하지 않습니다.");
    return;
  }
  if (!text || text.trim() === "") return;

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;          // 예: "en-US", "ko-KR"
  utter.rate = 1.0;           // 속도
  utter.pitch = 1.0;          // 피치
  utter.volume = 1.0;         // 볼륨

  window.speechSynthesis.speak(utter);
}

// ===== 전역 변수 =====
let recognition = null;
let isListening = false;

// ===== DOM 요소 =====
const inputBox   = document.getElementById("inputText");
const outputBox  = document.getElementById("outputText");
const startBtn   = document.getElementById("startBtn");
const stopBtn    = document.getElementById("stopBtn");
const sourceSel  = document.getElementById("sourceLang");
const targetSel  = document.getElementById("targetLang");

// ===== STT(음성 인식) 초기화 =====
function initRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("이 브라우저는 Web Speech API 음성 인식을 지원하지 않습니다. Chrome 사용을 권장합니다.");
    return null;
  }

  const recog = new SpeechRecognition();
  recog.lang = sourceSel.value || "ko-KR"; // 기본: 한국어
  recog.interimResults = true;            // 중간 결과도 받기
  recog.continuous = true;                // 계속 듣기

  recog.onstart = () => {
    isListening = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  recog.onend = () => {
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  recog.onerror = (event) => {
    console.error("음성 인식 오류:", event.error);
    isListening = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  // 인식 결과 처리
  recog.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].trim
        ? event.results[i][0].transcript
        : event.results[i][0].transcript;
    }

    // 왼쪽 박스에 실시간 표시
    inputBox.value = transcript;

    // 문장이 어느 정도 길어졌을 때 번역 실행
    // (너무 자주 호출되는 것 방지용)
    if (!event.results[event.results.length - 1].isFinal) return;

    translateAndSpeak(transcript);
  };

  return recog;
}

// ===== 번역 + 음성 출력 =====
async function translateAndSpeak(text) {
  if (!text || text.trim() === "") return;

  const sourceLang = sourceSel.value || "ko";
  const targetLang = targetSel.value || "en";

  outputBox.value = "Translating... / 번역 중...";

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLang,
        targetLang,
      }),
    });

    if (!res.ok) {
      throw new Error("서버 응답 오류: " + res.status);
    }

    const data = await res.json();
    const translated = (data.translatedText || "").trim();

    outputBox.value = translated;

    // 타겟 언어 코드에 맞게 TTS 언어 설정
    let ttsLang = "en-US";
    if (targetLang.startsWith("ko")) ttsLang = "ko-KR";
    if (targetLang.startsWith("es")) ttsLang = "es-ES";
    if (targetLang.startsWith("ja")) ttsLang = "ja-JP";
    if (targetLang.startsWith("zh")) ttsLang = "zh-CN";

    speak(translated, ttsLang);
  } catch (err) {
    console.error(err);
    outputBox.value = "번역 중 오류가 발생했습니다. (콘솔 확인)";
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
      recognition.lang = sourceSel.value || "ko-KR";
      recognition.start();
    }
  });

  stopBtn.addEventListener("click", () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  });
}

// ===== 텍스트 직접 입력 후 번역 버튼(optional) =====
// HTML에 id="translateBtn" 버튼이 있다면 활성화
const translateBtn = document.getElementById("translateBtn");
if (translateBtn) {
  translateBtn.addEventListener("click", () => {
    const text = inputBox.value;
    translateAndSpeak(text);
  });
}

