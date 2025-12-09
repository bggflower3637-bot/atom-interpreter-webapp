// 기본 언어 목록 (필요하면 추가 가능)
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

// 언어 옵션 채우기
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
  toSelect.value = "en"; // 기본 대상 언어
}

populateLanguages();

// 문자 수 표시
sourceText.addEventListener("input", () => {
  sourceCount.textContent = `${sourceText.value.length} / 500`;
});

// 로딩 상태 제어
function setLoading(isLoading) {
  if (isLoading) {
    translateBtn.disabled = true;
    translateBtn.innerHTML = "";
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    translateBtn.appendChild(spinner);
  } else {
    translateBtn.disabled = false;
    translateBtn.innerHTML = "<span id='translateBtnText'>Start Translation</span>";
  }
}

// 번역 버튼 클릭
translateBtn.addEventListener("click", async () => {
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
    // 1) 먼저 /api/translate 엔드포인트 호출 시도
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

    // 2) 백엔드가 없거나 실패하면 가짜 번역(fallback)
    if (!translated) {
      translated = `[${from.toUpperCase()} → ${to.toUpperCase()}] ` + text;
    }

    targetText.value = translated;
    statusBar.textContent = "Done.";
  } catch (err) {
    console.error(err);
    statusBar.textContent = "Error during translation. Please try again.";
  } finally {
    setLoading(false);
  }
});
