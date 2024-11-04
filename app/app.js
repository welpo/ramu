const state = {
  tts: { voice: null, isReady: false },
  config: {
    minNumber: 0,
    maxNumber: 10,
    numeralSystem: "arabic",
    showAnswerAfter: 2,
    answerDuration: 2.5,
    mode: "reading",
    enabledCounters: [""],
    voiceSpeed: 0.9,
  },
  session: {
    isActive: false,
    currentNumber: null,
    challengeTimer: null,
    answerTimer: null,
    isPaused: false,
    progress: 0,
    total: 20,
    isShowingAnswer: false,
    lastNumbers: [],
  },
};

const CONFIG_STORAGE_KEY = "ramu_config";
const AVOID_REPEAT_COUNT = 3; // How many previous numbers to avoid repeating.
const MAX_VALID_NUMBER = 1e72;
const MODE_DISPLAY = {
  reading: { icon: "👀", action: "reading" },
  listening: { icon: "👂", action: "listening" },
};

document.addEventListener("DOMContentLoaded", async () => {
  initDOM();
  voiceSpeed.addEventListener("input", (e) => {
    const speed = parseFloat(e.target.value);
    state.config.voiceSpeed = speed;
    voiceSpeedDisplay.textContent = `${speed}×`;
  });
  loadConfig();
  const ttsReady = await initTTS();
  if (!ttsReady) return;
  initValidation();
  startBtn.addEventListener("click", startSession);
  nextBtn.addEventListener("click", nextOrReveal);
  stopBtn.addEventListener("click", endSession);
  pauseBtn.addEventListener("click", togglePause);
});

function initDOM() {
  minNumber = document.getElementById("min-number");
  maxNumber = document.getElementById("max-number");
  numeralSystem = document.getElementById("numeral-system");
  showAnswerAfter = document.getElementById("show-answer-after");
  challengeContainer = document.querySelector(".challenge-container");
  answerDuration = document.getElementById("answer-duration");
  modeSelect = document.getElementById("mode-select");
  totalRounds = document.getElementById("total-rounds");
  startBtn = document.getElementById("start-btn");
  nextBtn = document.getElementById("next-btn");
  stopBtn = document.getElementById("stop-btn");
  pauseBtn = document.getElementById("pause-btn");
  voiceSelect = document.getElementById("voice-select");
  voiceSpeed = document.getElementById("voice-speed");
  voiceSpeedDisplay = document.getElementById("voice-speed-display");
  configPanel = document.getElementById("config-panel");
  practicePanel = document.getElementById("practice-panel");
  challengeDisplay = document.getElementById("challenge-display");
  modeDisplay = document.getElementById("mode-display");
  progressFill = document.getElementById("progress-fill");
  progressBar = document.getElementById("progress-bar");
  timerBarFill = document.querySelector(".timer-bar-fill");
  tagline = document.getElementById("tagline");
  githubCorner = document.getElementById("github-corner");
  screenReaderAnnouncement = document.getElementById(
    "screen-reader-announcement"
  );
  iOSInstallPrompt = document.getElementById("ios-install-prompt");
  closeiOSInstallPrompt = document.getElementById("close-ios-install-prompt");
  if (closeiOSInstallPrompt) {
    closeiOSInstallPrompt.addEventListener("click", () => {
      iOSInstallPrompt.style.display = "none";
    });
  }
}

function loadConfig() {
  // Voice gets loaded in initTTS, after getting available voices.
  const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!saved) return;
  try {
    const config = JSON.parse(saved);
    // Range.
    minNumber.value = config.minNumber;
    maxNumber.value = config.maxNumber;
    totalRounds.value = config.totalRounds;
    // Mode and numerals.
    if (config.numeralSystem) {
      numeralSystem.value = config.numeralSystem;
      state.config.numeralSystem = config.numeralSystem;
    }
    if (config.mode) {
      modeSelect.value = config.mode;
      state.config.mode = config.mode;
    }
    // Timers.
    showAnswerAfter.value = config.showAnswerAfter;
    answerDuration.value = config.answerDuration;
    // Counters.
    if (Array.isArray(config.enabledCounters)) {
      document.querySelectorAll(".counter-checkbox").forEach((cb) => {
        cb.checked = config.enabledCounters.includes(cb.value);
      });
      state.config.enabledCounters = config.enabledCounters;
    }
    if (config.voiceSpeed) {
      voiceSpeed.value = config.voiceSpeed;
      state.config.voiceSpeed = config.voiceSpeed;
      voiceSpeedDisplay.textContent = `${config.voiceSpeed}×`;
    }
  } catch (error) {
    console.error("Error loading saved config:", error);
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }
}

async function initTTS() {
  if (!("speechSynthesis" in window)) {
    showVoiceWarning();
    return false;
  }
  await new Promise((resolve) => {
    if (speechSynthesis.getVoices().length) {
      resolve();
    } else {
      speechSynthesis.onvoiceschanged = resolve;
    }
  });
  const japaneseVoices = getJapaneseVoices();
  if (!japaneseVoices.length) {
    showVoiceWarning();
    return false;
  }
  // Load saved voice preference or use first available.
  const savedVoice = localStorage.getItem(CONFIG_STORAGE_KEY)
    ? JSON.parse(localStorage.getItem(CONFIG_STORAGE_KEY)).selectedVoice
    : null;
  state.tts.voice = savedVoice
    ? japaneseVoices.find((v) => v.name === savedVoice) || japaneseVoices[0]
    : japaneseVoices[0];
  state.tts.isReady = true;
  setupVoiceSelector(japaneseVoices, state.tts.voice);
  return true;
}

function getJapaneseVoices() {
  const voices = speechSynthesis.getVoices();
  let japaneseVoices = voices
    .filter(
      (voice) =>
        voice.lang === "ja-JP" ||
        voice.lang === "ja" ||
        // Fix for Android.
        voice.name.toLowerCase().includes("japanese")
    )
    .sort(
      (a, b) =>
        Number(b.name.toLowerCase().includes("enhanced")) -
        Number(a.name.toLowerCase().includes("enhanced"))
    );
  const hasCompactAndSuperCompact =
    japaneseVoices.some((v) => v.voiceURI?.includes("compact")) &&
    japaneseVoices.some((v) => v.voiceURI?.includes("super-compact"));
  if (hasCompactAndSuperCompact) {
    japaneseVoices = japaneseVoices.filter(
      (voice) => !voice.voiceURI?.includes("super-compact")
    );
  }
  return japaneseVoices;
}

function setupVoiceSelector(voices, selectedVoice) {
  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.text = voice.name;
    option.selected = voice === selectedVoice;
    voiceSelect.appendChild(option);
  });
  voiceSelect.classList.remove("hidden");
  voiceSelect.addEventListener("change", (e) => {
    state.tts.voice = voices.find((v) => v.name === e.target.value);
  });
}

function showVoiceWarning() {
  const os = getOS();
  if (os) {
    const instructionsElement = document.getElementById(
      `${os.toLowerCase()}-instructions`
    );
    if (instructionsElement) {
      instructionsElement.open = true;
    }
  }
  document.getElementById("voice-warning").classList.remove("hidden");
}

function getOS() {
  // https://stackoverflow.com/a/38241481
  const userAgent = window.navigator.userAgent,
    platform =
      window.navigator?.userAgentData?.platform || window.navigator.platform,
    macosPlatforms = [
      "macOS",
      "Macintosh",
      "MacIntel",
      "MacPPC",
      "Mac68K",
      "darwin",
    ],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"];
  let os = null;
  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "MacOS";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "iOS";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "Windows";
  } else if (/Android/.test(userAgent)) {
    os = "Android";
  } else if (/Linux/.test(platform)) {
    os = "Linux";
  }
  return os;
}

function initValidation() {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", (e) => {
      validateInput(e.target);
      updateStartButton();
    });
  });
  updateStartButton();
}

function validateInput(input) {
  let isValidFormat;
  if (input.getAttribute("inputmode") === "numeric") {
    // Only allow integers and scientific notation without decimals (e.g., 2e3).
    isValidFormat = /^\d+(e\d+)?$/.test(input.value);
  } else if (input.getAttribute("inputmode") === "decimal") {
    // Allow decimals and scientific notation (e.g., 2.3e3, 3.14).
    isValidFormat = /^\d*\.?\d*(e\d+)?$/.test(input.value);
  } else {
    isValidFormat = /^\d+$/.test(input.value);
  }
  const value = Math.floor(parseFloat(input.value));
  let isValidBasic = isValidFormat && !isNaN(value) && value >= 0;
  if (input.id === "total-rounds") {
    isValidBasic = isValidBasic && value > 0;
  }
  let isValidRange = true;
  if (input.id === "min-number" || input.id === "max-number") {
    const minInput = minNumber;
    const maxInput = maxNumber;
    const minValue = Math.floor(parseFloat(minInput.value));
    const maxValue = Math.floor(parseFloat(maxInput.value));
    isValidRange = !isNaN(minValue) && !isNaN(maxValue) && minValue <= maxValue;
    setInvalidState(minInput, !isValidBasic || !isValidRange);
    setInvalidState(maxInput, !isValidBasic || !isValidRange);
    return;
  }
  setInvalidState(input, !isValidBasic);
}

function setInvalidState(input, isInvalid) {
  input.classList.toggle("input-error", isInvalid);
  input.setAttribute("aria-invalid", isInvalid);
}

// Disable start button if any input is invalid.
function updateStartButton() {
  const hasErrors = document.querySelector('input[aria-invalid="true"]');
  startBtn.disabled = hasErrors;
}

function startSession() {
  state.config.minNumber = Math.floor(parseFloat(minNumber.value));
  state.config.maxNumber = Math.floor(parseFloat(maxNumber.value));
  state.config.numeralSystem = numeralSystem.value;
  state.config.showAnswerAfter = parseFloat(showAnswerAfter.value);
  state.config.answerDuration = parseFloat(answerDuration.value);
  state.config.enabledCounters = Array.from(
    document.querySelectorAll(".counter-checkbox:checked")
  ).map((cb) => cb.value);
  state.config.mode = modeSelect.value;
  state.session.total = parseFloat(totalRounds.value);
  state.session.isActive = true;
  state.session.progress = 0;
  state.session.lastNumbers = [];
  if (state.session.isPaused) {
    togglePause(); // In case previous session ended while paused.
  }
  saveConfig();
  // Prime the TTS system with a silent utterance; needed for iOS.
  if (state.tts.isReady && isiOS()) {
    const silentUtterance = new SpeechSynthesisUtterance("あ");
    silentUtterance.volume = 0;
    silentUtterance.voice = state.tts.voice;
    silentUtterance.lang = "ja-JP";
    speechSynthesis.speak(silentUtterance);
  }
  togglePanels();
  nextChallenge();
}

function saveConfig() {
  const configToSave = {
    minNumber: Number(minNumber.value),
    maxNumber: Number(maxNumber.value),
    totalRounds: Number(totalRounds.value),
    numeralSystem: numeralSystem.value,
    mode: modeSelect.value,
    enabledCounters: Array.from(
      document.querySelectorAll(".counter-checkbox:checked")
    ).map((cb) => cb.value),
    showAnswerAfter: Number(showAnswerAfter.value),
    answerDuration: Number(answerDuration.value),
    voiceSpeed: state.config.voiceSpeed,
    selectedVoice: voiceSelect.value,
  };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
}

function isiOS() {
  const isIPhoneOrIPod = navigator.userAgent.match(/ipad|ipod|iphone/i);
  const isIPadOS =
    navigator.userAgent.match(/Mac/) && navigator.maxTouchPoints > 2;
  return isIPhoneOrIPod || isIPadOS;
}

function togglePanels() {
  configPanel.classList.toggle("hidden");
  practicePanel.classList.toggle("hidden");
  tagline.classList.toggle("hidden");
  githubCorner.classList.toggle("hidden");
  iOSInstallPrompt.style.display = "none";
}

function nextChallenge() {
  if (state.session.progress >= state.session.total) {
    endSession();
    return;
  }
  state.session.progress++;
  updateProgress(state.session.progress, state.session.total);
  showChallenge(generateNumber());
}

function updateProgress(current, total) {
  const percentage = (current / total) * 100;
  progressFill.style.width = `${percentage}%`;
  progressBar.setAttribute("aria-valuenow", Math.round(percentage));
  progressBar.setAttribute(
    "aria-valuetext",
    `${current} of ${total} rounds completed`
  );
}

async function showChallenge(number) {
  clearAllTimers();
  const display = challengeDisplay;
  state.session.currentNumber = number;
  state.session.isShowingAnswer = false;
  updateUIState(false);
  if (
    state.config.mode === "listening" ||
    // Make the display visually accessible but hidden from screen readers.
    (state.config.mode === "alternate" && state.session.progress % 2 === 1)
  ) {
    display.textContent = "???";
    display.setAttribute("aria-hidden", "true");
    await speakAndWait(number);
  } else {
    display.textContent = number;
    // In reading mode, the number is visible but not read by screen readers; TTS will read it.
    display.setAttribute("aria-hidden", "true");
    if (isArabicNumeral(state.session.currentNumber)) {
      announceToScreenReader(number);
    }
  }
  updateUIState(false);
  startChallengeTimer();
}

function clearAllTimers() {
  cancelAnimationFrame(state.session.challengeTimer);
  cancelAnimationFrame(state.session.answerTimer);
  timerBarFill.style.transform = "scaleX(1)";
}

function updateUIState(isAnswer) {
  challengeContainer.classList.remove("question", "answer");
  challengeContainer.classList.add(isAnswer ? "answer" : "question");
  if (state.config.mode === "alternate") {
    const currentMode =
      state.session.progress % 2 === 1 ? "listening" : "reading";
    const { icon, action } = MODE_DISPLAY[currentMode];
    modeDisplay.textContent = `${icon} ${action}`;
    modeDisplay.classList.remove("hidden");
  } else {
    modeDisplay.classList.add("hidden");
  }
}

function isArabicNumeral(str) {
  return /^\d+$/.test(str);
}

const isFirefox = /Chrome/.test(navigator.userAgent);

function announceToScreenReader(message) {
  // Chrome announces twice if we set the tabindex to -1. Firefox doesn't announce at all until user enters web content. Setting tabindex to -1 fixes it. Safari doesn't care either way.
  if (isFirefox) {
    screenReaderAnnouncement.setAttribute("tabindex", "-1");
  }
  screenReaderAnnouncement.textContent = message;
  screenReaderAnnouncement.focus();
}

function speakAndWait(text) {
  if (!state.tts.isReady) return Promise.resolve();
  speechSynthesis.cancel();
  return new Promise((resolve) => {
    if (!state.session.isActive) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.toString());
    utterance.voice = state.tts.voice;
    utterance.lang = "ja-JP";
    utterance.rate = state.config.voiceSpeed;
    utterance.onend = resolve;
    speechSynthesis.speak(utterance);
  });
}

function startChallengeTimer() {
  const duration = state.config.showAnswerAfter;
  const startTime = performance.now();
  const timerFill = timerBarFill;
  timerFill.style.transform = "scaleX(1)";
  function updateTimer(currentTime) {
    if (state.session.isPaused) return;
    const elapsed = (currentTime - startTime) / 1000;
    const remaining = duration - elapsed;
    if (remaining <= 0) {
      showAnswer();
      return;
    }
    const fillPercent = remaining / duration;
    timerFill.style.transform = `scaleX(${fillPercent})`;
    state.session.challengeTimer = requestAnimationFrame(updateTimer);
  }
  state.session.challengeTimer = requestAnimationFrame(updateTimer);
}

async function showAnswer() {
  cancelAnimationFrame(state.session.challengeTimer);
  state.session.isShowingAnswer = true;
  const display = challengeDisplay;
  display.textContent = state.session.currentNumber;
  const timerFill = timerBarFill;
  timerFill.style.display = "block";
  timerFill.style.transform = "scaleX(0)";
  updateUIState(true);
  // If in listening mode or odd-numbered challenge in 'alternate' mode
  if (
    state.config.mode === "listening" ||
    (state.config.mode === "alternate" && state.session.progress % 2 === 1)
  ) {
    if (isArabicNumeral(state.session.currentNumber)) {
      announceToScreenReader(state.session.currentNumber);
    }
    await speakAndWait(state.session.currentNumber);
  } else {
    // In reading mode; use Japanese TTS.
    await speakAndWait(state.session.currentNumber);
  }
  const answerDurationMs = state.config.answerDuration * 1000;
  const startTime = performance.now();
  function updateAnswerTimer(currentTime) {
    if (state.session.isPaused) return;
    const elapsed = currentTime - startTime;
    const fillPercent = Math.min(elapsed / answerDurationMs, 1);
    timerFill.style.transform = `scaleX(${fillPercent})`;
    if (elapsed >= answerDurationMs) {
      nextChallenge();
      return;
    }
    state.session.answerTimer = requestAnimationFrame(updateAnswerTimer);
  }
  state.session.answerTimer = requestAnimationFrame(updateAnswerTimer);
}

function endSession() {
  state.session.isActive = false;
  speechSynthesis.cancel();
  clearAllTimers();
  togglePanels();
  if (
    // After a iOS/iPadOS user completes their first full session, show PWA install prompt.
    isiOS() &&
    state.session.progress === state.session.total &&
    !window.matchMedia("(display-mode: standalone)").matches &&
    !localStorage.getItem("showniOSInstallPrompt")
  ) {
    iOSInstallPrompt.style.display = "block";
    localStorage.setItem("showniOSInstallPrompt", "true");
  }
  announceToScreenReader("Practice session ended");
  startBtn.focus();
}

function nextOrReveal() {
  if (state.session.isShowingAnswer) {
    nextChallenge();
  } else {
    showAnswer();
  }
}

function togglePause() {
  state.session.isPaused = !state.session.isPaused;
  const btn = pauseBtn;
  btn.classList.toggle("icon-pause");
  btn.classList.toggle("icon-play");
  btn.setAttribute("aria-pressed", state.session.isPaused);
  btn.setAttribute(
    "aria-label",
    state.session.isPaused ? "Resume practice" : "Pause practice"
  );
  if (!state.session.isPaused) {
    if (state.session.isShowingAnswer) {
      nextChallenge();
    } else {
      startChallengeTimer();
    }
  }
}

function generateNumber() {
  const { minNumber, maxNumber, enabledCounters, numeralSystem } = state.config;
  const possibleNumbers = maxNumber - minNumber + 1;
  const windowSize = Math.min(AVOID_REPEAT_COUNT, possibleNumbers - 1);
  let number = minNumber;
  if (possibleNumbers > 1) {
    do {
      number = Math.floor(Math.random() * possibleNumbers) + minNumber;
    } while (state.session.lastNumbers.includes(number));
    state.session.lastNumbers.push(number);
    if (state.session.lastNumbers.length > windowSize)
      state.session.lastNumbers.shift();
  }
  const counter =
    state.config.enabledCounters.length > 0
      ? shuffleFromArray(enabledCounters)
      : "";
  const system =
    numeralSystem === "both"
      ? shuffleFromArray(["arabic", "kanji"])
      : numeralSystem;
  return formatNumber(number, system) + counter;
}

function shuffleFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatNumber(num, system) {
  return system === "kanji" ? convertToKanji(num) : num.toString();
}

const KANJI = {
  digits: ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
  places: { 1000: "千", 100: "百", 10: "十" },
  units: [
    { value: 1e68, symbol: "無量大数" },
    { value: 1e64, symbol: "不可思議" },
    { value: 1e60, symbol: "那由他" },
    { value: 1e56, symbol: "阿僧祇" },
    { value: 1e52, symbol: "恒河沙" },
    { value: 1e48, symbol: "極" },
    { value: 1e44, symbol: "載" },
    { value: 1e40, symbol: "正" },
    { value: 1e36, symbol: "澗" },
    { value: 1e32, symbol: "溝" },
    { value: 1e28, symbol: "穣" },
    { value: 1e24, symbol: "秭" },
    { value: 1e20, symbol: "垓" },
    { value: 1e16, symbol: "京" },
    { value: 1e12, symbol: "兆" },
    { value: 1e8, symbol: "億" },
    { value: 1e4, symbol: "万" },
  ],
};

function convertToKanji(num) {
  if (!Number.isFinite(num)) return num.toString();
  if (num === 0) return KANJI.digits[0];
  if (num < 0) return num.toString();
  if (num >= MAX_VALID_NUMBER) return num.toString();
  for (const { value, symbol } of KANJI.units) {
    if (num === value) {
      return "一" + symbol;
    }
  }
  return convertLargeNumber(num);
}

function convertLargeNumber(num) {
  let result = "";
  let remaining = num;
  for (const { value, symbol } of KANJI.units) {
    const quotient = Math.floor(remaining / value);
    if (quotient > 0) {
      if (quotient >= 1e4) {
        // Convert recursively.
        result += convertToKanji(quotient) + symbol;
      } else {
        result += convertBasicNumber(quotient) + symbol;
      }
    }
    remaining %= value;
  }
  if (remaining > 0) {
    result += convertBasicNumber(remaining);
  }
  return result;
}

function convertBasicNumber(num) {
  if (num < 0 || num >= 1e4)
    throw new Error("Basic number must be between 0 and 9999");
  if (num < 10) return KANJI.digits[num];
  return (
    [1000, 100, 10].reduce((result, place) => {
      const multiplier = Math.floor(num / place);
      if (multiplier === 0) return result;
      const unit = KANJI.places[place];
      const prefix = multiplier === 1 ? "" : KANJI.digits[multiplier];
      num %= place;
      return result + prefix + unit;
    }, "") + (num > 0 ? KANJI.digits[num] : "")
  );
}

const KEYBOARD_SHORTCUTS = {
  KeyP: togglePause,
  Escape: endSession,
  ArrowRight: nextOrReveal,
  Space: nextOrReveal,
  Enter: (e) => {
    // Enter starts a session if nothing else is focused.
    if (document.activeElement === document.body) {
      e.preventDefault();
      if (!state.session.isActive && !startBtn.disabled) {
        startSession();
      }
    }
  },
};

document.addEventListener("keydown", (e) => {
  if (KEYBOARD_SHORTCUTS[e.code]) {
    if (e.code === "Enter" || state.session.isActive) {
      KEYBOARD_SHORTCUTS[e.code](e);
    }
  }
});

// Run tests with ?test query parameter.
if (new URLSearchParams(window.location.search).has("test")) {
  const script = document.createElement("script");
  script.src = "tests.js";
  document.head.appendChild(script);
}
