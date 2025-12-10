// 사용 언어 리스트
const languages = [
  { code: "auto", label: "Auto Detect" },
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "es", label: "Spanish" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "vi", label: "Vietnamese" }
];

const fromSelect = document.getElementById("fromLang");
const toSelect = document.getElementById("toLang");
const sourceText = document.getElementById("sourceText");
const targetText = document.getElementById("targetText");
const sourceCount = document.getElementById("sourceCount");
const translateBtn = document.getElementById("translateBtn");
const statusBar = document.getElementById("statusBar");
const flagButton = document.getElementById("flagButton");

// 언어 선택 박스 채우기
function populateLanguages() {
  languages.forEach((lang) => {
    const optFrom = document.createElement("option");
    optFrom.value = lang.code;
    optFrom.textContent = lang.label;
    fromSelect.appendChild(optFrom);

    const optTo = document.createElement("option");
    optTo.value = lang.code;
    optTo.textContent = lang.label;
    toSelect.appendChild(optTo);
  });

  fromSelect.value = "auto";
  toSelect.value = "en";
}

populateLanguages();

// 글자 수 카운트
sourceText.addEventListener("input", () => {
  sourceCount.textContent = `${sourceText.value.length} / 500`;
});

// 로딩 상태 처리
function setLoading(isLoading) {
  if (!translateBtn) return;

  if (isLoading) {
    translateBtn.disabled = true;
    translateBtn.innerHTML = "";
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    translateBtn.appendChild(spinner);
  } else {
    translateBtn.disabled = false;
    translateBtn.innerHTML =
      "<span id='translateBtnText'>Start Translation</span>";
  }
}

// 실제 번역 함수
async function handleTranslate() {
  const text = sourceText.value.trim();
  if (!text) {
    statusBar.textContent = "Please enter text to translate.";
    return;
  }

  const from = fromSelect.value;
  const to = toSelect.value;

  if (from === to && from !== "auto") {
    statusBar.textContent = "From/To languages are the same.";
    return;
  }

  setLoading(true);
  statusBar.textContent = "Translating…";

  try {
    // 실제 백엔드 번역 API 호출
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, from, to })
    });

    let translated;

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.translation === "string") {
        translated = data.translation;
      }
    }

    // 실패 시 가짜 번역 (Fallback)
    if (!translated) {
      translated = `[${from.toUpperCase()} → ${to.toUpperCase()}] ${text}`;
    }

    targetText.value = translated;
    statusBar.textContent = "Done.";
  } catch (err) {
    console.error(err);
    statusBar.textContent = "Error during translation. Please try again.";
  } finally {
    setLoading(false);
  }
}

// 숨겨져 있는 직사각형 버튼 (혹시 모를 경우를 위해 연결 유지)
if (translateBtn) {
  translateBtn.addEventListener("click", handleTranslate);
}

// 🔥 메인: 가운데 동그란 버튼 → 번역 실행
if (flagButton) {
  flagButton.addEventListener("click", handleTranslate);
}
