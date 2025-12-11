const translateButton = document.getElementById("translateButton");
const fromLangSelect = document.getElementById("fromLang");
const toLangSelect = document.getElementById("toLang");
const sourceTextEl = document.getElementById("sourceText");
const targetTextEl = document.getElementById("targetText");

if (translateButton) {
  translateButton.addEventListener("click", async () => {
    const text = sourceTextEl.value.trim();
    const fromLang = fromLangSelect.value;
    const toLang = toLangSelect.value;

    if (!text) {
      targetTextEl.value = "Please enter text to translate.";
      return;
    }

    targetTextEl.value = "Translating with Atom…";

    try {
      // TODO: 여기에 실제 백엔드 API 경로 연결
      // const res = await fetch("/api/text-translate", { ... });
      // const data = await res.json();
      // targetTextEl.value = data.translatedText || "(no result)";

      // 지금은 데모이므로 그대로 에코 + 언어 정보 보여주기
      targetTextEl.value = `[Demo] ${fromLang} → ${toLang}\n\n${text}`;
    } catch (err) {
      console.error(err);
      targetTextEl.value =
        "Sorry, something went wrong while contacting the server.";
    }
  });
}



 
