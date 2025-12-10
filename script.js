/* ===========================
   GLOBAL
=========================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at top, #f5f7ff, #e3e6f0);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Helvetica Neue", Arial, sans-serif;
}

/* ===========================
   PHONE FRAME
=========================== */
.phone-frame {
  width: 390px;
  min-height: 780px;
  background: white;
  border-radius: 36px;
  padding: 0;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
  position: relative;
}

.notch {
  width: 120px;
  height: 20px;
  background: black;
  border-radius: 20px;
  margin: 20px auto 10px auto;
}

/* ===========================
   INNER CONTENT LAYOUT
=========================== */
.inner {
  padding: 40px;
}

/* ===========================
   HEADER
=========================== */
.app-header {
  text-align: center;
  margin-bottom: 18px;
}

.app-title {
  font-size: 26px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: "Times New Roman", serif !important;
  font-weight: bold;
}

.subtitle {
  font-size: 12px;
  letter-spacing: 0.25em;
  color: #777;
  margin-top: 4px;
}

/* ===========================
   FIELD BLOCK
=========================== */
.field {
  margin-bottom: 18px;
}

label {
  font-size: 13px;
  color: #555;
  margin-bottom: 6px;
  display: block;
}

select,
textarea {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #ddd;
  font-size: 14px;
  outline: none;
  resize: none;
  font-family: inherit;
  background: #fdfdfd;
}

/* ===========================
   CENTER BADGE IMAGE
=========================== */
.flag-badge-wrapper {
  display: flex;
  justify-content: center;
  margin: 20px 0 28px 0;
}

.flag-badge {
  width: 130px;        /* ← 이미지 크기 조정 */
  height: 130px;
  border-radius: 50%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.flag-badge img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ===========================
   STATUS BAR
=========================== */
.status-bar {
  text-align: center;
  font-size: 13px;
  color: #777;
  margin-bottom: 12px;
}

/* ===========================
   BUTTONS
=========================== */
.primary-btn,
.upgrade-btn {
  width: 100%;
  padding: 15px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  transition: 0.2s;
  font-weight: 500;
}

.primary-btn {
  background: #3232ff;
  color: white;
}

.primary-btn:hover {
  opacity: 0.85;
}

.upgrade-btn {
  margin-top: 14px;
  background: #f6e9c8;
  color: #8a6b00;
}

.upgrade-btn:hover {
  background: #f1dfb0;
}
