// ======= 상태 변수 =======
let isRecording = false;
let sourceLang = "auto";
let targetLang = "en";

let mediaStream = null;
let mediaRecorder = null;
let audioChunks = [];

// ======= 엘리먼트 =======
const root = document.querySelector(".app-root");
const micButton = document.getElementById("micButton");
const clearButton = document.getElementById("clearButton");

const sourceTextEl = document.getElementById("sourceText");
const targetTextEl = document.getElementById("targetText");

const sourceLangGrid = document.getElementById("sourceLangGrid");
const targetLangGrid = document.getElementById("targetLangGrid");
const sourceLangLabel = document.getElementById("sourceLangLabel");
const targetLangLabel = document.getElementById("targetLangLabel");
const currentSourceLabel = document.getElementById("currentSourceLabel");
const currentTargetLabel = document.getElementById("currentTargetLabel");

// =======================
// 1) 마이크 버튼 토글
// =======================
micButton.addEventListener("click", async () => {
  if (!isRecording) {
    isRecording = true;
    root.classList.add("is-recording");
    await startAtomSession();
  } else {
    isRecording = false;
    root.classList.remove("is-recording");
    stopAtomSession();
  }
});

// =======================
// 2) 언어 선택 (Source / Target)
// =======================
function handleLangClick(event, gridEl, type) {
  const btn = event.target.closest(".lang-pill");
  if (!btn) return;

  const lang = btn.dataset.lang;
  if (!lang) return;

  // active 이동
  [...gridEl.querySelectorAll(".lang-pill")].forEach((b) =>
    b.classList.remove("active")
  );
  btn.classList.add("active");

  const labelText = btn.innerText.trim();

  if (type === "source") {
    sourceLang = lang;
    const label =
      lang === "auto" ? "Auto Detect" : labelText;
    sourceLangLabel.textContent = lang === "auto" ? "Auto" : label;
    currentSourceLabel.textContent = label;
  } else {
    targetLang = lang;
    targetLangLabel.textContent = labelText;
    currentTargetLabel.textContent = labelText;
  }

  updateLangOnServer();
}

sourceLangGrid.addEventListener("click", (e) =>
  handleLangClick(e, sourceLangGrid, "source")
);
targetLangGrid.addEventListener("click", (e) =>
  handleLangClick(e, targetLangGrid, "target")
);

// =======================
// 3) 텍스트 클리어
// =======================
clearButton.addEventListener("click", () => {
  sourceTextEl.textContent = "Waiting for input…";
  targetTextEl.textContent =
    "When you speak, your interpreted message will appear here.";
});

// =======================
// 4) ATOM 세션 시작 (녹음 시작)
// =======================
async function startAtomSession() {
  try {
    // 이미 녹음 중이면 무시
    if (mediaRecorder && mediaRecorder.state === "recording") return;

    // 마이크 권한 요청
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    mediaRecorder = new MediaRecorder(mediaStream, {
      mimeType: "audio/webm",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // 녹음 시작
    mediaRecorder.start();

    // UI 안내 문구
    sourceTextEl.textContent = "Listening… Speak freely.";
    targetTextEl.textContent =
      "When you tap stop, Atom will interpret and show the result here.";

    // stop 이벤트 안에서 서버 전송
    mediaRecorder.onstop = async () => {
      if (!audioChunks.length) return;

      const blob = new Blob(audioChunks, { type: "audio/webm" });

      // ====== 여기가 백엔드 연동 부분 ======
      // 필요하다면 '/api/translate' 경로를
      // Khan이 실제로 만들어둔 API 경로로 바꿔주면 됨
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");
      formData.append("sourceLang", sourceLang);
      formData.append("targetLang", targetLang);

      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("API error: " + res.status);
        }

        const data = await res.json();

        // 백엔드에서 어떤 필드명을 쓰는지에 따라 아래를 맞춰주면 됨
        const source =
          data.sourceText || data.transcript || data.text || "(no source text)";
        const target =
          data.targetText ||
          data.translation ||
          data.translatedText ||
          "(no translation)";

        sourceTextEl.textContent = source;
        targetTextEl.textContent = target;
      } catch (err) {
        console.error(err);
        targetTextEl.textContent =
          "Sorry, something went wrong while contacting the server.";
      } finally {
        // 스트림 정리
        cleanupMedia();
        isRecording = false;
        root.classList.remove("is-recording");
      }
    };
  } catch (err) {
    console.error("Microphone error:", err);
    sourceTextEl.textContent =
      "Cannot access microphone. Please check browser permission.";
    targetTextEl.textContent = "";
    isRecording = false;
    root.classList.remove("is-recording");
    cleanupMedia();
  }
}

// =======================
// 5) ATOM 세션 정지 (버튼 누를 때)
// =======================
function stopAtomSession() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop(); // onstop 이벤트에서 서버로 전송
  } else {
    cleanupMedia();
  }
}

// =======================
// 6) 미디어 스트림 정리
// =======================
function cleanupMedia() {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
  audioChunks = [];
}

// =======================
// 7) 언어 변경 서버에 전달 (선택사항)
// =======================
function updateLangOnServer() {
  // 필요 없다면 비워둬도 OK.
  // Khan이 이미 이런 API를 만들어놨다면 여기서 호출.
  // fetch("/api/update-language", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ sourceLang, targetLang }),
  // });
}
