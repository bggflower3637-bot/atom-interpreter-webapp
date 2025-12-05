// Atom Interpreter demo script
// 브라우저만 사용하는 데모 버전:
// 1) 음성 인식
// 2) 데모용 "번역" 텍스트
// 3) 브라우저 TTS로 소리 출력

window.addEventListener('DOMContentLoaded', () => {
  const fromSelect = document.getElementById('fromLanguage');
  const toSelect = document.getElementById('toLanguage');
  const startBtn = document.getElementById('startDemo');
  const stopBtn = document.getElementById('stopDemo');
  const statusEl = document.getElementById('statusText');
  const originalEl = document.getElementById('originalSpeech');
  const translatedEl = document.getElementById('translatedSpeech');

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;      // 계속 듣기
    recognition.interimResults = true;   // 중간 결과도 받기
  } else {
    if (statusEl) {
      statusEl.textContent =
        '이 브라우저에서는 음성 인식이 지원되지 않습니다. 크롬을 사용해 주세요.';
    }
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  // ---------- 브라우저 TTS (소리 내기) ----------
  function speakText(text, langCode) {
    if (!window.speechSynthesis) {
      console.warn('speechSynthesis not available');
      return;
    }
    if (!text) return;

    try {
      const utter = new SpeechSynthesisUtterance(text);

      if (langCode) {
        utter.lang = langCode;
      }

      // 언어 코드에 맞는 목소리 찾기 시도
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length && langCode) {
        const base = langCode.split('-')[0];
        const v =
          voices.find((v) => v.lang === langCode) ||
          voices.find((v) => v.lang.startsWith(base));
        if (v) utter.voice = v;
      }

      // 이전에 말하던 것 정리하고 새로 말하기
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error('TTS error', err);
    }
  }

  // ---------- 언어 코드 매핑 ----------
  function getLangCode(selectValue) {
    switch (selectValue) {
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

  // ---------- 데모용 "번역" ----------
  function fakeTranslate(text, from, to) {
    const fromCode = getLangCode(from);
    const toCode = getLangCode(to);

    // 여기서는 진짜 번역 대신 데모용 태그만 붙임
    if (fromCode === 'ko-KR' && toCode === 'en-US') {
      return `[English demo] ${text}`;
    }
    if (fromCode === 'en-US' && toCode === 'ko-KR') {
      return `[Korean demo] ${text}`;
    }
    return `[${to} demo] ${text}`;
  }

  function handleFinalResult(text) {
    const fromLang = fromSelect.value;
    const toLang = toSelect.value;

    const translated = fakeTranslate(text, fromLang, toLang);
    translatedEl.value = translated;

    const toLangCode = getLangCode(toLang);
    speakText(translated, toLangCode); // 번역된 결과를 해당 언어로 읽어줌
  }

  // ---------- 음성 인식 이벤트 ----------
  if (recognition) {
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
      setStatus('음성 인식 오류가 발생했습니다. 다시 시도해 주세요.');
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

      // 왼쪽 박스에 전체 텍스트 보여주기
      const combined = (finalTranscript + ' ' + interimTranscript).trim();
      if (combined) {
        originalEl.value = combined;
      }

      // 최종 문장이 확정되면 번역 + TTS
      if (finalTranscript) {
        handleFinalResult(finalTranscript.trim());
      }
    };
  }

  // ---------- 버튼 이벤트 ----------
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (!recognition) return;

      if (isListening) {
        // 이미 듣고 있으면 멈췄다가 다시 시작
        recognition.stop();
      }

      const fromLangCode = getLangCode(fromSelect.value);
      recognition.lang = fromLangCode;

      // 오토플레이 제한 우회용: 빈 문장을 한 번 speak 해서 권한 확보
      speakText('', getLangCode(toSelect.value));

      originalEl.value = '';
      translatedEl.value = '';
      setStatus('Preparing microphone...');

      try {
        recognition.start();
      } catch (err) {
        console.error('recognition.start error', err);
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

