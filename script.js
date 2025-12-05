// script.js - 아주 단순한 데모 버전
// 기능:
// 1) 브라우저 Web Speech API로 음성 인식
// 2) 왼쪽 박스에 실시간 텍스트 표시
// 3) 오른쪽 박스에는 [English demo] + 같은 문장 표시
// 4) 인식이 끝나면 오른쪽 문장을 선택된 언어로 읽어줌(TTS)

window.addEventListener('DOMContentLoaded', () => {
  const fromSelect = document.getElementById('fromLang');          // 언어 From
  const toSelect = document.getElementById('toLang');              // 언어 To
  const startBtn = document.getElementById('start-btn');           // Start Demo 버튼
  const stopBtn = document.getElementById('stop-btn');             // Stop 버튼
  const originalBox = document.getElementById('originalSpeech');   // 왼쪽 텍스트박스
  const translatedBox = document.getElementById('translatedSpeech'); // 오른쪽 텍스트박스
  const statusText = document.getElementById('statusText');        // 상태 문구

  let recognition = null;
  let listening = false;

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

    // From 선택에 따라 인식 언어 설정
    rec.lang = fromSelect.value === 'ko' ? 'ko-KR' : 'en-US';
    return rec;
  }

  // 2. 텍스트를 TTS로 읽어주는 함수
  function speak(text) {
    if (!window.speechSynthesis) return;
    const clean = text.trim();
    if (!clean) return;

    const utter = new SpeechSynthesisUtterance(clean);

    // To 언어 기준으로 목소리 선택
    const voices = speechSynthesis.getVoices();
    let voice = null;
    if (voices && voices.length) {
      if (toSelect.value === 'ko') {
        voice = voices.find(v => v.lang.startsWith('ko'));
      } else {
        // 기본값: 영어
        voice = voices.find(v => v.lang.startsWith('en'));
      }
    }
    if (voice) utter.voice = voice;

    utter.rate = 1.0;
    utter.pitch = 1.0;

    // 이전에 말하던 거 있으면 정리
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  // 3. 음성 인식 시작
  function startListening() {
    if (listening) return;

    recognition = createRecognition();
    if (!recognition) return;

    listening = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    statusText.textContent = 'Listening... 이제 말하시면 됩니다.';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript + ' ';
        }
      }

      const fullText = (finalTranscript + interimTranscript).trim();
      originalBox.value = fullText || '입력된 음성이 여기에 표시됩니다.';

      // 진짜 번역이 아니라 데모 표시만: 영어 선택 시 [English demo] 붙이기
      if (fullText) {
        if (toSelect.value === 'en') {
          translatedBox.value = '[English demo] ' + fullText;
        } else {
          translatedBox.value = '[Korean demo] ' + fullText;
        }
      } else {
        translatedBox.value = '여기에 번역된 문장이 표시되고, 스피커로 재생됩니다.';
      }
    };

    recognition.onerror = (event) => {
      listening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      statusText.textContent = '에러 발생: ' + event.error;
    };

    recognition.onend = () => {
      // 사용자가 말을 멈추거나 Stop을 눌렀을 때
      listening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      statusText.textContent = 'Stopped. 다시 시작하려면 "Start Demo"를 클릭하세요.';

      // 인식된 문장을 읽어준다
      const toSpeak = translatedBox.value;
      speak(toSpeak);
    };

    recognition.start();
  }

  // 4. 음성 인식 중단
  function stopListening() {
    if (!listening || !recognition) return;
    recognition.stop();
  }

  // 5. 버튼 이벤트 연결
  startBtn.addEventListener('click', startListening);
  stopBtn.addEventListener('click', stopListening);

  // 6. 언어 바꿨을 때 바로 반영되도록 (다음 Start부터 적용)
  fromSelect.addEventListener('change', () => {
    if (!listening) {
      statusText.textContent = 'Idle – click "Start Demo" to begin.';
    }
  });
  toSelect.addEventListener('change', () => {
    if (!listening) {
      statusText.textContent = 'Idle – click "Start Demo" to begin.';
    }
  });

  // TTS 목소리 리스트 로드 (일부 브라우저용)
  if (window.speechSynthesis) {
    speechSynthesis.onvoiceschanged = () => {};
  }
});


   


