/* ===========================
   GLOBAL
=========================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top, #f5f7ff, #e3e6f0);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Helvetica Neue", Arial, sans-serif;
}

/* ===========================
   PHONE FRAME
=========================== */
.phone-frame {
  width: 390px;
  min-height: 780px;
  background: white;
  border-radius: 36px;
  padding: 0;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  position: relative;
}

.notch {
  width: 120px;
  height: 20px;
  background: black;
  border-radius: 20px;
  margin: 20px auto 10px auto;
}

/* ===========================
   INNER CONTENT LAYOUT
=========================== */
.inner {
  padding: 40px;
}

/* ===========================
   HEADER
=========================== */
.app-header {
  text-align: center;
  margin-bottom: 18px;
}

.app-title {
  font-size: 26px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: "Times New Roman", serif !important;
  font-weight: bold;
}

.subtitle {
  font-size: 12px;
  letter-spacing: 0.25em;
  color: #777;
  margin-top: 4px;
}

/* ===========================
   FIELD BLOCK
=========================== */
.field {
  margin-bottom: 18px;
}

label {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

select,
textarea {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #ddd;
  font-size: 14px;
  outline: none;
  resize: none;
  font-family: inherit;
  background: #fdfdfd;
}

/* ===========================
   CENTER BADGE IMAGE
=========================== */
.flag-badge-wrapper {
  display: flex;
  justify-content: center;
  margin: 20px 0 28px 0;
}

.flag-badge {
  width: 130px;        /* ← 이미지 크기 조정 */
  height: 130px;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.flag-badge img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===========================
   STATUS BAR
=========================== */
.status-bar {
  text-align: center;
  font-size: 13px;
  color: #777;
  margin-bottom: 12px;
}

/* ===========================
   BUTTONS
=========================== */
.primary-btn,
.upgrade-btn {
  width: 100%;
  padding: 15px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
  font-weight: 500;
}

.primary-btn {
  background: #3232ff;
  color: white;
}

.primary-btn:hover {
  opacity: 0.85;
}

.upgrade-btn {
  margin-top: 14px;
  background: #f6e9c8;
  color: #8a6b00;
}

.upgrade-btn:hover {
  background: #f1dfb0;
}
// 기본 상태
let isRecording = false;
let sourceLang = "auto";
let targetLang = "en";

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

// --- 마이크 토글 ---
micButton.addEventListener("click", () => {
  isRecording = !isRecording;
  root.classList.toggle("is-recording", isRecording);

  if (isRecording) {
    startAtomSession();
  } else {
    stopAtomSession();
  }
});

// --- 언어 선택 공통 함수 ---
function handleLangClick(event, gridEl, type) {
  const btn = event.target.closest(".lang-pill");
  if (!btn) return;

  const lang = btn.dataset.lang;
  if (!lang) return;

  // active 클래스 이동
  [...gridEl.querySelectorAll(".lang-pill")].forEach((b) =>
    b.classList.remove("active")
  );
  btn.classList.add("active");

  if (type === "source") {
    sourceLang = lang;
    const label = lang === "auto" ? "Auto Detect" : btn.innerText.trim();
    sourceLangLabel.textContent = lang === "auto" ? "Auto" : label;
    currentSourceLabel.textContent = label;
  } else {
    targetLang = lang;
    const label = btn.innerText.trim();
    targetLangLabel.textContent = label;
    currentTargetLabel.textContent = label;
  }

  // 필요하다면 여기에서 언어 변경을 백엔드에 알려줄 수 있음
  updateLangOnServer();
}

sourceLangGrid.addEventListener("click", (e) =>
  handleLangClick(e, sourceLangGrid, "source")
);
targetLangGrid.addEventListener("click", (e) =>
  handleLangClick(e, targetLangGrid, "target")
);

// --- 텍스트 지우기 ---
clearButton.addEventListener("click", () => {
  sourceTextEl.textContent = "Waiting for input…";
  targetTextEl.textContent =
    "When you speak, your interpreted message will appear here.";
});

// --- 여기부터 기존 실시간 통역 로직 붙이기 ---

function startAtomSession() {
  // TODO: 여기 Khan이 사용하던
  //  - 마이크 활성화
  //  - WebSocket / fetch 요청
  //  - 스트리밍 텍스트 업데이트
  // 코드 붙이기

  // 예시: 스트리밍 도중에 텍스트 업데이트할 때 이런 식으로 사용
  //   sourceTextEl.textContent = incomingOriginal;
  //   targetTextEl.textContent = incomingTranslated;
}

function stopAtomSession() {
  // TODO: 여기 마이크 종료 + 스트림 종료 코드 붙이기
}

// 서버에 언어 변경 전달 (필요 없으면 비워둬도 됨)
function updateLangOnServer() {
  // ex)
  // fetch("/api/update-language", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ sourceLang, targetLang }),
  // });
}

