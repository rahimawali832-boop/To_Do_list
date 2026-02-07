// ================================
// TAB SWITCH SYSTEM
// ================================
const tabButtons = document.querySelectorAll(".tab-btn");
const tabs = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ================================
// HOME BUTTON
// ================================
document.getElementById("homeBtn").addEventListener("click", () => {
  window.location.href = "index.html"; // change to your home file name
});

// ================================
// DIGITAL CLOCK + ANALOG CLOCK
// ================================
const liveClock = document.getElementById("liveClock");
const liveDate = document.getElementById("liveDate");

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");

function updateClock() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  let h12 = hours % 12 || 12;
  let ampm = hours >= 12 ? "PM" : "AM";

  liveClock.innerText =
    `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${ampm}`;

  liveDate.innerText = now.toDateString();

  // ANALOG
  const secDeg = seconds * 6;
  const minDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  secondHand.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
  minuteHand.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
  hourHand.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;

  checkAlarms(now);
}

setInterval(updateClock, 1000);
updateClock();

// ================================
// STOPWATCH
// ================================
let stopwatchRunning = false;
let stopwatchStart = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;

const stopwatchDisplay = document.getElementById("stopwatchDisplay");
const lapList = document.getElementById("lapList");

function formatStopwatch(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  let milliseconds = ms % 1000;

  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function updateStopwatch() {
  const now = Date.now();
  stopwatchElapsed = now - stopwatchStart;
  stopwatchDisplay.innerText = formatStopwatch(stopwatchElapsed);
}

document.getElementById("startStopwatch").addEventListener("click", () => {
  if (stopwatchRunning) return;

  stopwatchRunning = true;
  stopwatchStart = Date.now() - stopwatchElapsed;

  stopwatchInterval = setInterval(updateStopwatch, 20);
});

document.getElementById("pauseStopwatch").addEventListener("click", () => {
  stopwatchRunning = false;
  clearInterval(stopwatchInterval);
});

document.getElementById("resetStopwatch").addEventListener("click", () => {
  stopwatchRunning = false;
  clearInterval(stopwatchInterval);
  stopwatchElapsed = 0;
  stopwatchDisplay.innerText = "00:00:00.000";
  lapList.innerHTML = "";
});

document.getElementById("lapStopwatch").addEventListener("click", () => {
  if (!stopwatchRunning) return;

  const lapItem = document.createElement("div");
  lapItem.className = "item";
  lapItem.innerHTML = `<span>Lap: ${formatStopwatch(stopwatchElapsed)}</span>`;
  lapList.prepend(lapItem);
});

// ================================
// TIMER (MULTIPLE TIMERS + SAVE)
// ================================
let timerInterval = null;
let timerRemaining = 0;
let timerRunning = false;

const timerDisplay = document.getElementById("timerDisplay");
const activeTimers = document.getElementById("activeTimers");

function formatTimer(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.innerText = formatTimer(timerRemaining);
}

document.getElementById("startTimer").addEventListener("click", () => {
  if (timerRunning) return;

  const h = parseInt(document.getElementById("timerHours").value || 0);
  const m = parseInt(document.getElementById("timerMinutes").value || 0);
  const s = parseInt(document.getElementById("timerSeconds").value || 0);

  if (timerRemaining === 0) {
    timerRemaining = h * 3600 + m * 60 + s;
  }

  if (timerRemaining <= 0) return;

  timerRunning = true;

  timerInterval = setInterval(() => {
    timerRemaining--;

    updateTimerDisplay();

    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDisplay.innerText = "00:00:00";
      alert("⏳ Timer Finished!");
    }
  }, 1000);
});

document.getElementById("pauseTimer").addEventListener("click", () => {
  timerRunning = false;
  clearInterval(timerInterval);
});

document.getElementById("resetTimer").addEventListener("click", () => {
  timerRunning = false;
  clearInterval(timerInterval);
  timerRemaining = 0;
  updateTimerDisplay();
});

document.getElementById("saveTimer").addEventListener("click", () => {
  const h = parseInt(document.getElementById("timerHours").value || 0);
  const m = parseInt(document.getElementById("timerMinutes").value || 0);
  const s = parseInt(document.getElementById("timerSeconds").value || 0);

  const total = h * 3600 + m * 60 + s;

  if (total <= 0) {
    alert("Enter a valid timer time!");
    return;
  }

  const savedTimers = JSON.parse(localStorage.getItem("savedTimers") || "[]");

  savedTimers.push({
    id: Date.now(),
    seconds: total,
    label: formatTimer(total)
  });

  localStorage.setItem("savedTimers", JSON.stringify(savedTimers));
  renderSavedTimers();
});

// ================================
// SAVED TIMERS RENDER
// ================================
function renderSavedTimers() {
  const savedTimersDiv = document.getElementById("savedTimers");
  const savedTimers = JSON.parse(localStorage.getItem("savedTimers") || "[]");

  savedTimersDiv.innerHTML = `<h4 style="color:rgba(255,255,255,0.6);margin-bottom:10px;">⏳ Timers</h4>`;

  savedTimers.forEach(t => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div>
        <span>${t.label}</span>
        <small>Saved Timer</small>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="start">Start</button>
        <button class="delete">X</button>
      </div>
    `;

    item.querySelector(".start").addEventListener("click", () => {
      timerRemaining = t.seconds;
      updateTimerDisplay();
      alert("Timer Loaded! Go to Timer tab and press Start.");
    });

    item.querySelector(".delete").addEventListener("click", () => {
      const updated = savedTimers.filter(x => x.id !== t.id);
      localStorage.setItem("savedTimers", JSON.stringify(updated));
      renderSavedTimers();
    });

    savedTimersDiv.appendChild(item);
  });
}

// ================================
// ALARM SYSTEM
// ================================
const alarmList = document.getElementById("alarmList");
const alarmSound = document.getElementById("alarmSound");

document.getElementById("addAlarmBtn").addEventListener("click", () => {
  const time = document.getElementById("alarmTime").value;
  const label = document.getElementById("alarmLabel").value.trim();

  if (!time) {
    alert("Please select alarm time!");
    return;
  }

  const savedAlarms = JSON.parse(localStorage.getItem("savedAlarms") || "[]");

  savedAlarms.push({
    id: Date.now(),
    time: time,
    label: label || "Alarm Reminder",
    active: true
  });

  localStorage.setItem("savedAlarms", JSON.stringify(savedAlarms));
  document.getElementById("alarmLabel").value = "";
  renderAlarms();
});

function renderAlarms() {
  const savedAlarms = JSON.parse(localStorage.getItem("savedAlarms") || "[]");
  alarmList.innerHTML = "";

  savedAlarms.forEach(alarm => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div>
        <span>${alarm.time}</span>
        <small>${alarm.label}</small>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="start">${alarm.active ? "On" : "Off"}</button>
        <button class="delete">X</button>
      </div>
    `;

    item.querySelector(".start").addEventListener("click", () => {
      alarm.active = !alarm.active;
      localStorage.setItem("savedAlarms", JSON.stringify(savedAlarms));
      renderAlarms();
      renderSavedAlarms();
    });

    item.querySelector(".delete").addEventListener("click", () => {
      const updated = savedAlarms.filter(x => x.id !== alarm.id);
      localStorage.setItem("savedAlarms", JSON.stringify(updated));
      renderAlarms();
      renderSavedAlarms();
    });

    alarmList.appendChild(item);
  });

  renderSavedAlarms();
}

function renderSavedAlarms() {
  const savedAlarmsDiv = document.getElementById("savedAlarms");
  const savedAlarms = JSON.parse(localStorage.getItem("savedAlarms") || "[]");

  savedAlarmsDiv.innerHTML = `<h4 style="color:rgba(255,255,255,0.6);margin:20px 0 10px;">⏰ Alarms</h4>`;

  savedAlarms.forEach(a => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div>
        <span>${a.time}</span>
        <small>${a.active ? "Active" : "Disabled"} | ${a.label}</small>
      </div>
    `;
    savedAlarmsDiv.appendChild(item);
  });
}

// ================================
// CHECK ALARMS LIVE
// ================================
function checkAlarms(now) {
  const savedAlarms = JSON.parse(localStorage.getItem("savedAlarms") || "[]");

  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  savedAlarms.forEach(alarm => {
    if (alarm.active && alarm.time === currentTime) {
      alarm.active = false;
      localStorage.setItem("savedAlarms", JSON.stringify(savedAlarms));

      alarmSound.play();
      alert(`⏰ Alarm: ${alarm.label}`);

      renderAlarms();
      renderSavedAlarms();
    }
  });
}

// ================================
// CLEAR ALL SAVED DATA
// ================================
document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (confirm("Delete all saved timers and alarms?")) {
    localStorage.removeItem("savedTimers");
    localStorage.removeItem("savedAlarms");
    renderSavedTimers();
    renderAlarms();
  }
});

// ================================
// INITIAL LOAD
// ================================
renderSavedTimers();
renderAlarms();
updateTimerDisplay();
