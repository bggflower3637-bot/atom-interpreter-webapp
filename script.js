// Atom Interpreter - 안전 데모 버전
// 1) 음성 인식 (브라우저 Web Speech API)
// 2) 데모용 "번역" 텍스트
// 3) 브라우저 TTS(합성음)로 소리 출력

window.addEventListener('DOMContentLoaded', () => {
  // ---- DOM 요소들 ----
  const startBtn = document.getElementById('startDemo');
  const stopBtn = document.getElementById('stopDemo');
  const statusEl = document.getElementById('statusText'); // 없으면 그냥 null
  const originalEl = document.getElementById('originalSpeech');
  const translatedEl = document.getElementById('translatedSpeech');

  // 셀렉트 박스는 있어도 되고 없어도 됨
  const fromSelect = document.getElementById('fromLanguage');
  const toSelect = document.getElementById('toLanguage');

  // ---- 언어 선택이 없어도 기본값으로 동작하도록 ----
  function getFromLanguage() {
    // 셀렉트 박스가 있으면 그 값, 없으면 Korean 고정
    if (fromSelect && fromSelect.value) return fromSelect.value;
    return 'Korean';
  }

  function getToLanguage() {
    if (toSelect && toSelect.value) return toSelect.value;
    return 'English';
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  // ---- 브라우저 음성 인식 준비 ----
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
  } else {
    setStatus(
      '이 브라우저에서는 음성 인식이 지원되지 않습니다. 크롬 브라우저를 사용해 주세요.'
    );
    console.warn('SpeechRecognition not available');
    return; // 더 이상 진행해도 소용 없음
  }

  // ---- 언어 코드 매핑 ----
  function getLangCode(name) {
    switch (name) {
      case 'Korean':
        return 'ko-KR';
      case 'English':
        return 'en-US';
      case 'Japanese':
        return 'ja-JP';
      case 'Spanish':
        return 'es-ES';
      default:
        return 'en-US';
    }
  }

  // ---- 브라우저 TTS (소리 내기) ----
  function speakText(text, langCode) {
    if (!window.speechSynthesis || !text) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);
      if (langCode) utter.lang = langCode;

      // 가능한 경우, 언어에 맞는 목소리 선택
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length && langCode) {
        const base = langCode.split('-')[0];
        const v =
          voices.find((v) => v.lang === langCode) ||
          voices.find((v) => v.lang.startsWith(base));
        if (v) utter.voice = v;
      }

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error('TTS error', e);
    }
  }

  // ---- 데모용 "번역" ----
  function fakeTranslate(text, fromName, toName) {
    const fromCode = getLangCode(fromName);
    const toCode = getLangCode(toName);

    if (fromCode === 'ko-KR' && toCode === 'en-US') {
      return `[English demo] ${text}`;
    }
    if (fromCode === 'en-US' && toCode === 'ko-KR') {
      return `[Korean demo] ${text}`;
    }
    return `[${toName} demo] ${text}`;
  }

  function handleFinalResult(text) {
    const fromName = getFromLanguage();
    const toName = getToLanguage();

    const translated = fakeTranslate(text, fromName, toName);
    if (translatedEl) translatedEl.value = translated;

    const toCode = getLangCode(toName);
    speakText(translated, toCode);
  }

  // ---- 음성 인식 이벤트 ----
  recognition.onstart = () => {
    isListening = true;
    setStatus('Listening... you can keep speaking.');
  };

  recognition.onend = () => {
    isListening = false;
    setStatus('Stopped. Click "Start Demo" to listen again.');
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event);
    setStatus('음성 인식 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    isListening = false;
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) {
        finalTranscript += res[0].transcript;
      } else {
        interimTranscript += res[0].transcript;
      }
    }

    const combined = (finalTranscript + ' ' + interimTranscript).trim();
    if (combined && originalEl) {
      originalEl.value = combined;
    }

    if (finalTranscript) {
      handleFinalResult(finalTranscript.trim());
    }
  };

  // ---- 버튼 이벤트 ----
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!recognition) return;

      try {
        if (isListening) {
          recognition.stop();
        }

        const fromName = getFromLanguage();
        const fromCode = getLangCode(fromName);
        recognition.lang = fromCode;

        if (originalEl) originalEl.value = '';
        if (translatedEl) translatedEl.value = '';

        setStatus('Preparing microphone...');
        recognition.start();
      } catch (e) {
        console.error('recognition.start error', e);
      }
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    });
  }
});

   
