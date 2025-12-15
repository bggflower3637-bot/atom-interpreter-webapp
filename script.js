01 const translateBtn = document.getElementById("translateBtn");
02 const inputText = document.getElementById("inputText");
03 const outputText = document.getElementById("outputText");
04 const fromLang = document.getElementById("fromLang");
05 const toLang = document.getElementById("toLang");
06 const upgradeBtn = document.getElementById("upgradeBtn");
07 
08 async function doTranslate() {
09   const text = (inputText.value || "").trim();
10   if (!text) {
11     outputText.value = "";
12     return;
13   }
14 
15   outputText.value = "Translating...";
16 
17   const payload = {
18     text,
19     sourceLang: fromLang.value === "auto" ? null : fromLang.value,
20     targetLang: toLang.value
21   };
22 
23   try {
24     const res = await fetch("/api/translate", {
25       method: "POST",
26       headers: { "Content-Type": "application/json" },
27       body: JSON.stringify(payload)
28     });
29 
30     // 서버가 에러면, JSON 아닐 수도 있으니 안전하게 처리
31     const contentType = res.headers.get("content-type") || "";
32     const data = contentType.includes("application/json") ? await res.json() : { error: await res.text() };
33 
34     if (!res.ok) {
35       outputText.value = data?.error || "Translation failed";
36       return;
37     }
38 
39     outputText.value = data?.output || "";
40   } catch (err) {
41     outputText.value = "Network error";
42     console.error(err);
43   }
44 }
45 
46 translateBtn.addEventListener("click", doTranslate);
47 
48 // 편의: Ctrl+Enter로 번역
49 inputText.addEventListener("keydown", (e) => {
50   if (e.ctrlKey && e.key === "Enter") doTranslate();
51 });
52 
53 // Upgrade 버튼은 지금은 동작 안 하게(추후 결제 연결)
54 upgradeBtn.addEventListener("click", () => {
55   alert("Coming soon.");
56 });
