const translateButton = document.getElementById("translateButton");
const fromLangSelect = document.getElementById("fromLang");
const toLangSelect = document.getElementById("toLang");
const sourceTextEl = document.getElementById("sourceText");
const targetTextEl = document.getElementById("targetText");
const atomButton = document.getElementById("atomButton");

// 메인 번역 버튼 클릭 로직 (현재는 데모 모드)
if (translateButton) {
  translateButton.addEventListener("click", async () => {
    const text = (sourceTextEl && sourceTextEl.value.trim()) || "";
    const fromLang = fromLangSelect ? fromLangSelect.value : "auto";
    const toLang = toLangSelect ? toLangSelect.value : "en";

    if (!text) {
      if (targetTextEl) {
        targetTextEl.value = "Please enter text to translate.";
      }
      return;
    }

    if (targetTextEl) {
      targetTextEl.value = "Translating with Atom...";
    }

    try {
      // TODO: 여기 나중에 실제 백엔드 번역 API 연결
      // const res = await fetch("/api/text-translate", { ... });
      // const data = await res.json();
      // targetTextEl.value = data.translatedText || "(no result)";

      // 데모: 입력 텍스트 그대로 보여주기
      if (targetTextEl) {
        targetTextEl.value = `[Demo] ${fromLang} → ${toLang}\n\n${text}`;
      }
    } catch (err) {
      console.error(err);
      if (targetTextEl) {
        targetTextEl.value = "Error: failed to translate. Please try again.";
      }
    }
  });
}

// ⭐ 가운데 금태 원형 버튼 → 메인 번역 버튼을 대신 클릭
if (atomButton && translateButton) {
  atomButton.addEventListener("click", () => {
    translateButton.click();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("translateBtn");
  const input = document.getElementById("inputText");
  const output = document.getElementById("outputText");
  const from = document.getElementById("sourceLang");
  const to = document.getElementById("targetLang");

  btn.addEventListener("click", async () => {
    const text = (input.value || "").trim();
    if (!text) return;

    output.value = "Translating...";

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        sourceLang: from?.value || "Auto",
        targetLang: to?.value || "English",
      }),
    });

    const data = await res.json();
    output.value = data.output || "";
  });
});


