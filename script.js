const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const originalText = document.getElementById("original-text");
const translatedText = document.getElementById("translated-text");

let demoTimer = null;

function setStatus(mode, text) {
  statusIndicator.classList.remove("idle", "listening", "processing");
  statusIndicator.classList.add(mode);
  statusText.textContent = text;
}

startBtn.addEventListener("click", () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  setStatus("listening", "Listening (demo)… In the real version this will capture microphone audio.");

  originalText.value =
    "This is a demo of Atom Interpreter running inside a web app.\n" +
    "In the production version, your live speech will appear here in real time.";

  if (demoTimer) clearTimeout(demoTimer);

  demoTimer = setTimeout(() => {
    setStatus("processing", "Processing (demo)… Translating recognized speech.");
    translatedText.value =
      "이 화면은 Atom Interpreter가 웹앱 안에서 동작하는 데모입니다.\n" +
      "실제 버전에서는 사용자의 마이크 음성을 인식해서, 여기에 실시간 번역 결과가 표시됩니다.";
  }, 1500);
});

stopBtn.addEventListener("click", () => {
  if (demoTimer) clearTimeout(demoTimer);
  startBtn.disabled = false;
  stopBtn.disabled = true;
  setStatus("idle", "Stopped. Click “Start Demo” to simulate interpretation again.");
});

/*
  TODO: 실제 구현 시 이 파일에 다음 로직을 추가하면 됨:

  1. 브라우저 마이크 접근 (MediaDevices.getUserMedia)
  2. 오디오 스트림을 Vercel 서버리스 함수로 전송
  3. 서버에서 OpenAI Realtime / STT + 번역 + TTS 처리
  4. 번역된 텍스트를 translatedText에 넣고, 오디오를 스피커로 재생

  지금은 UI 데모용이므로 fake 텍스트만 보여준다.
*/
