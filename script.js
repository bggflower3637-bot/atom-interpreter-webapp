const micBtn = document.getElementById("micBtn");
const result = document.getElementById("result");

let recorder;
let audioChunks = [];

micBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream);

  recorder.ondataavailable = e => audioChunks.push(e.data);

  recorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    audioChunks = [];

    const formData = new FormData();
    formData.append("file", audioBlob);

    const res = await fetch("/api/interpret", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    result.value = data.text;
  };

  recorder.start();
  setTimeout(() => recorder.stop(), 5000); // 5초 녹음
};
