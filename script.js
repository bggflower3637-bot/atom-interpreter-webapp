const translateButton = document.getElementById("translateButton");
const fromLangSelect = document.getElementById("fromLang");
const toLangSelect = document.getElementById("toLang");
const sourceTextEl = document.getElementById("sourceText");
const targetTextEl = document.getElementById("targetText");
const atomButton = document.getElementById("atomButton");

// 메인 번역 버튼 클릭 로직 (현재는 데모 모드)
if (translateButton) {
  translateButton.addEventListener("click", async () => {
    const text = sourceTextEl ? sourceTextEl.value.trim() : "";
    const fromLang = fromLangSelect ? fromLangSelect.value : "auto";
    const toLang = toLangSelect ? toLangSelect.value : "en";

    if (!text) {
      if (targetTextEl) {
        targetTextEl.value = "Please enter text to translate.";
      }
      return;
    }

    if (targetTextEl) {
      targetTextEl.value = "Translating with Atom…";
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
        targetTextEl.value =
          "Sorry, something went wrong while contacting the server.";
      }
    }
  });
}

// 가운데 국기 동그라미 클릭 시 → Translate 버튼 대신 눌러주기
if (atomButton && translateButton) {
  atomButton.addEventListener("click", () => {
    translateButton.click();
  });
}
