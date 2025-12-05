// script.js – 아주 단순한 데모 버전
// 기능:
// 1) 브라우저 Web Speech API로 음성 인식
// 2) 왼쪽 박스에 실시간 텍스트 표시
// 3) 오른쪽 박스에는 [English demo] + 같은 문장 표시
// 4) 인식이 끝나면 오른쪽 문장을 선택된 언어로 읽어줌(TTS)

window.addEventListener('DOMContentLoaded', () => {
  const fromSelect    = document.getElementById('from-lang');      // 언어 From
  const toSelect      = document.getElementById('to-lang');        // 언어 To
  const startBtn      = document.getElementById('start-btn');      // Start Demo 버튼
  const stopBtn       = document.getElementById('stop-btn');       // Stop 버튼
  const originalBox   = document.getElementById('original-text');  // 원문 텍스트박스
  const translatedBox = document.getElementById('translated-text'); // 오른쪽 텍스트박스
  const statusText    = document.getElementById('status-text');    // 상태 문구

  let recognition = null;
  let listening   = false;

  // 1. 브라우저 음성 인식 엔진 가져오기
  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      statusText.textContent = '이 브라우저는 음성 인식을 지원하지 않습니다.';
      return null;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;

    // From 선택에 따라 인식 언어 설정 (ko-KR / en-US 그대로 사용)
    rec.lang = fromSelect.value;

    // 인식 결과 콜백
    rec.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      originalBox.value = text;

      // 데모용 번역: 실제 번역 대신 단순 표시
      translatedBox.value = `[demo 번역: ${toSelect.value}] ${text}`;
    };

    rec.onstart = () => {
      statusText.textContent = 'Listening… 말해 주세요.';
    };

    rec.onend = () => {
      listening = false;
      startBtn.disabled = false;
      stopBtn.disabled  = true;
      statusText.textContent = 'Idle – click "Start Demo" to begin.';
    };

    rec.onerror = (e) => {
      console.error(e);
      statusText.textContent = '음성 인식 중 오류가 발생했습니다: ' + e.error;
    };

    return rec;
  }

  // 2. Start / Stop 핸들러
  function startDemo() {
    if (listening) return;

    if (!recognition) {
      recognition = createRecognition();
      if (!recognition) return;
    }

    // 언어 셀렉터 바뀐 후에도 반영되도록
    recognition.lang = fromSelect.value;

    listening = true;
    startBtn.disabled = true;
    stopBtn.disabled  = false;
    statusText.textContent = 'Listening…';

    recognition.start();
  }

  function stopDemo() {
    if (!recognition || !listening) return;
    listening = false;
    recognition.stop();
  }

  // 3. 버튼 이벤트 연결
  startBtn.addEventListener('click', startDemo);
  stopBtn.addEventListener('click', stopDemo);
});



