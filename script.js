// =======================
// ELEMENTS
// =======================
const taskText = document.getElementById("taskText");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

const pendingCount = document.getElementById("pendingCount");
const progressBar = document.getElementById("progress");
const priorityText = document.getElementById("priorityText");

// Custom dropdowns
const categorySelect = document.getElementById("categorySelect");
const prioritySelect = document.getElementById("prioritySelect");

let selectedCategory = "Work";
let selectedPriority = "Low";

// Reminder Modal
const reminderModal = document.getElementById("reminderModal");
const clockBtn = document.getElementById("clockBtn");
const closeModal = document.getElementById("closeModal");
const saveReminderBtn = document.getElementById("saveReminderBtn");

const reminderDate = document.getElementById("reminderDate");
const reminderTime = document.getElementById("reminderTime");

// Calendar Modal
const calendarBtn = document.getElementById("calendarBtn");
const calendarModal = document.getElementById("calendarModal");
const closeCalendarModal = document.getElementById("closeCalendarModal");
const calendarTitle = document.getElementById("calendarTitle");
const calendarDays = document.getElementById("calendarDays");

const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const miladiDate = document.getElementById("miladiDate");
const shamsiDate = document.getElementById("shamsiDate");
const qamariDate = document.getElementById("qamariDate");
const useDateBtn = document.getElementById("useDateBtn");

// =======================
// DATA
// =======================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let selectedReminder = { date: "", time: "" };
let selectedCalendarDate = "";

// =======================
// LOCAL STORAGE FUNCTIONS
// =======================
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => renderTask(task));
  updateDashboard();
}

// =======================
// CUSTOM SELECT DROPDOWN
// =======================
function setupCustomSelect(selectElement, callback) {
  const selectBox = selectElement.querySelector(".select-box");
  const options = selectElement.querySelector(".options");
  const optionItems = selectElement.querySelectorAll(".option");
  const selectedText = selectElement.querySelector(".selected-text");

  selectBox.addEventListener("click", () => {
    selectElement.classList.toggle("active");
  });

  optionItems.forEach(option => {
    option.addEventListener("click", () => {
      optionItems.forEach(o => o.classList.remove("selected"));
      option.classList.add("selected");

      selectedText.textContent = option.textContent;
      callback(option.dataset.value);

      selectElement.classList.remove("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!selectElement.contains(e.target)) {
      selectElement.classList.remove("active");
    }
  });
}

setupCustomSelect(categorySelect, (value) => selectedCategory = value);
setupCustomSelect(prioritySelect, (value) => selectedPriority = value);

// =======================
// ADD TASK
// =======================
addTaskBtn.addEventListener("click", () => {
  if (taskText.value.trim() === "") {
    alert("Please enter a task!");
    return;
  }

  const task = {
    id: Date.now(),
    text: taskText.value.trim(),
    category: selectedCategory,
    priority: selectedPriority,
    date: selectedCalendarDate,
    reminder: selectedReminder,
    completed: false
  };

  tasks.push(task);
  saveTasks();
  renderTask(task);
  updateDashboard();

  taskText.value = "";
});

// =======================
// RENDER TASK
// =======================
function renderTask(task) {
  const taskItem = document.createElement("div");
  taskItem.classList.add("task-item");

  if (task.completed) taskItem.classList.add("completed");

  // color based on priority
  let borderColor = "#ffd369";
  if (task.priority === "High") borderColor = "#ff4d4d";
  if (task.priority === "Medium") borderColor = "#ffd369";
  if (task.priority === "Low") borderColor = "#8f7cff";

  taskItem.style.borderLeft = `6px solid ${borderColor}`;

  taskItem.innerHTML = `
    <div class="task-left">
      <span class="task-tag">${task.category}</span>

      <div>
        <p class="task-text">${task.text}</p>

        <small style="color:#bdbdbd; font-size:12px;">
          📅 ${task.date ? task.date : "No date"} 
          ${task.reminder.date ? " | ⏰ " + task.reminder.date + " " + task.reminder.time : ""}
          | ⭐ ${task.priority}
        </small>
      </div>
    </div>

    <div class="task-actions">
      <button class="done-btn">✓</button>
      <button class="del-btn">✕</button>
    </div>
  `;

  // Done button
  taskItem.querySelector(".done-btn").addEventListener("click", () => {
    task.completed = !task.completed;
    saveTasks();
    loadTasks();
  });

  // Delete button
  taskItem.querySelector(".del-btn").addEventListener("click", () => {
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    loadTasks();
  });

  taskList.appendChild(taskItem);
}

// =======================
// DASHBOARD UPDATE
// =======================
function updateDashboard() {
  const pending = tasks.filter(t => !t.completed).length;
  pendingCount.textContent = `${pending} Tasks Pending`;

  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;

  let percent = total === 0 ? 0 : (done / total) * 100;
  progressBar.style.width = percent + "%";

  const highPriority = tasks.filter(t => t.priority === "High" && !t.completed);

  if (highPriority.length > 0) {
    priorityText.textContent = `⚠️ ${highPriority.length} High Priority Task(s)`;
  } else {
    priorityText.textContent = "No high priority tasks.";
  }
}

// =======================
// CLOCK MODAL (REMINDER)
// =======================
clockBtn.addEventListener("click", () => {
  reminderModal.classList.add("active");
});

closeModal.addEventListener("click", () => {
  reminderModal.classList.remove("active");
});

reminderModal.addEventListener("click", (e) => {
  if (e.target === reminderModal) {
    reminderModal.classList.remove("active");
  }
});

saveReminderBtn.addEventListener("click", () => {
  if (!reminderDate.value || !reminderTime.value) {
    alert("Please select date and time!");
    return;
  }

  selectedReminder = {
    date: reminderDate.value,
    time: reminderTime.value
  };

  alert("Reminder Saved!");
  reminderModal.classList.remove("active");
});

// =======================
// CALENDAR MODAL SYSTEM
// =======================
let currentMonth = 0;
let currentYear = 2026;
let selectedDateObj = null;

calendarBtn.addEventListener("click", () => {
  calendarModal.classList.add("active");
  renderCalendar(currentYear, currentMonth);
});

closeCalendarModal.addEventListener("click", () => {
  calendarModal.classList.remove("active");
});

calendarModal.addEventListener("click", (e) => {
  if (e.target === calendarModal) {
    calendarModal.classList.remove("active");
  }
});

prevMonth.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
});

nextMonth.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
});

function renderCalendar(year, month) {
  calendarDays.innerHTML = "";

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  calendarTitle.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.classList.add("day", "disabled");
    calendarDays.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day");
    dayBox.textContent = day;

    dayBox.addEventListener("click", () => {
      document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
      dayBox.classList.add("active");

      selectedDateObj = new Date(year, month, day);

      const miladi = selectedDateObj.toDateString();
      miladiDate.textContent = "Miladi: " + miladi;

      const shamsi = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(selectedDateObj);

      shamsiDate.textContent = "Shamsi: " + shamsi;

      const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }).format(selectedDateObj);

      qamariDate.textContent = "Qamari: " + hijri;

      selectedCalendarDate = miladi;
    });

    calendarDays.appendChild(dayBox);
  }
}

// Use date
useDateBtn.addEventListener("click", () => {
  if (!selectedDateObj) {
    alert("Please select a date first!");
    return;
  }

  alert("Calendar date selected!");
  calendarModal.classList.remove("active");
});

// =======================
// LOAD TASKS ON START
// =======================
loadTasks();
// =======================
// PROFILE MODAL SYSTEM
// =======================
const openProfile = document.getElementById("openProfile");
const profileModal = document.getElementById("profileModal");
const closeProfileModal = document.getElementById("closeProfileModal");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileCountry = document.getElementById("profileCountry");
const profileBio = document.getElementById("profileBio");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const profilePreview = document.getElementById("profilePreview");
const profileImage = document.getElementById("profileImage");


// Open Profile Modal
openProfile.addEventListener("click", () => {
  profileModal.classList.add("active");
  loadProfile();
});

// Close Profile Modal
closeProfileModal.addEventListener("click", () => {
  profileModal.classList.remove("active");
});

// Close if click outside
profileModal.addEventListener("click", (e) => {
  if (e.target === profileModal) {
    profileModal.classList.remove("active");
  }
});

// Save Profile
saveProfileBtn.addEventListener("click", () => {
  const profileData = {
    name: profileName.value,
    email: profileEmail.value,
    phone: profilePhone.value,
    country: profileCountry.value,
    bio: profileBio.value,
    image: profilePreview.src
  };

  localStorage.setItem("profileData", JSON.stringify(profileData));

  // update sidebar name live
  document.querySelector(".logo").textContent = profileData.name || "Rahima";

  alert("Profile saved successfully!");
  profileModal.classList.remove("active");
});


// Load Profile
function loadProfile() {
  const saved = JSON.parse(localStorage.getItem("profileData"));

  if (saved) {
    profileName.value = saved.name || "";
    profileEmail.value = saved.email || "";
    profilePhone.value = saved.phone || "";
    profileCountry.value = saved.country || "";
    profileBio.value = saved.bio || "";
    profilePreview.src = saved.image || "https://i.pravatar.cc/120";

    document.querySelector(".logo").textContent = saved.name || "Rahima";
  }
}


// Upload Profile Image
profileImage.addEventListener("change", (e) => {
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function () {
      profilePreview.src = reader.result;
    };

    reader.readAsDataURL(file);
  }
});

// Load profile when page loads
loadProfile();
function checkReminders() {
  const now = new Date();
  tasks.forEach(task => {
    if (task.reminder.date && task.reminder.time && !task.reminder.notified) {
      const [hours, minutes] = task.reminder.time.split(":");
      const reminderDate = new Date(task.reminder.date);
      reminderDate.setHours(hours, minutes, 0);

      if (reminderDate <= now) {
        new Notification("Task Reminder", { body: task.text });
        task.reminder.notified = true;
        saveTasks();
      }
    }
  });
}
// =======================
// PLAYLIST SYSTEM (ADVANCED)
// =======================

document.addEventListener("DOMContentLoaded", () => {

  // عناصر Playlist
  const playlistContainer = document.getElementById("playlistContainer");
  const addPlaylistBtn = document.getElementById("addPlaylistBtn");

  const playlistModal = document.getElementById("playlistModal");
  const closePlaylistModal = document.getElementById("closePlaylistModal");
  const savePlaylistBtn = document.getElementById("savePlaylistBtn");

  const playlistNameInput = document.getElementById("playlistNameInput");
  const playlistDateInput = document.getElementById("playlistDateInput");
  const playlistTimeInput = document.getElementById("playlistTimeInput");

  const playlistColors = document.querySelectorAll(".color-dot");

  // اگر HTML درست نباشد
  if (!playlistContainer || !addPlaylistBtn || !playlistModal) {
    console.log("❌ Playlist HTML elements not found! Check IDs in HTML.");
    return;
  }

  // رنگ پیشفرض
  let selectedColor = "#8f7cff";

  // Load data from localStorage
  let playlists = JSON.parse(localStorage.getItem("playlists")) || [];
  let activePlaylist = localStorage.getItem("activePlaylist") || "Dashboard";

  // =======================
  // SAVE TO LOCAL STORAGE
  // =======================
  function savePlaylists() {
    localStorage.setItem("playlists", JSON.stringify(playlists));
    localStorage.setItem("activePlaylist", activePlaylist);
  }

  // =======================
  // RENDER PLAYLISTS
  // =======================
  function renderPlaylists() {
    playlistContainer.innerHTML = "";

    if (playlists.length === 0) {
      playlistContainer.innerHTML = `
        <li style="color:#777; font-size:13px; padding:10px;">
          No playlists yet...
        </li>
      `;
      return;
    }

    playlists.forEach((pl, index) => {

      // اگر قدیمی string ذخیره شده باشد
      if (typeof pl === "string") {
        pl = { name: pl, color: "#8f7cff", date: "", time: "" };
        playlists[index] = pl;
        savePlaylists();
      }

      const li = document.createElement("li");
      li.classList.add("playlist-item");

      li.innerHTML = `
        <div class="playlist-left">
          <span class="playlist-color" style="background:${pl.color};"></span>
          <span class="playlist-name">${pl.name}</span>
        </div>

        <div class="playlist-actions">
          <button class="playlist-delete" title="Delete Playlist">✕</button>
        </div>
      `;

      // Active playlist style
      if (pl.name === activePlaylist) {
        li.classList.add("active");
      }

      // Select playlist
      li.querySelector(".playlist-left").addEventListener("click", () => {
        activePlaylist = pl.name;
        savePlaylists();
        renderPlaylists();

        console.log("✅ Active Playlist:", activePlaylist);
      });

      // Delete playlist
      li.querySelector(".playlist-delete").addEventListener("click", (e) => {
        e.stopPropagation();

        const confirmDelete = confirm(`Delete playlist "${pl.name}" ?`);
        if (!confirmDelete) return;

        playlists = playlists.filter(p => p.name !== pl.name);

        if (activePlaylist === pl.name) {
          activePlaylist = "Dashboard";
        }

        savePlaylists();
        renderPlaylists();
      });

      playlistContainer.appendChild(li);
    });
  }

  // =======================
  // OPEN MODAL
  // =======================
  addPlaylistBtn.addEventListener("click", () => {
    playlistModal.classList.add("active");

    playlistNameInput.value = "";
    playlistDateInput.value = "";
    playlistTimeInput.value = "";

    selectedColor = "#8f7cff";

    // reset color selection
    playlistColors.forEach(dot => dot.classList.remove("active"));
    if (playlistColors.length > 0) playlistColors[0].classList.add("active");

    setTimeout(() => playlistNameInput.focus(), 200);
  });

  // =======================
  // CLOSE MODAL
  // =======================
  closePlaylistModal.addEventListener("click", () => {
    playlistModal.classList.remove("active");
  });

  playlistModal.addEventListener("click", (e) => {
    if (e.target === playlistModal) {
      playlistModal.classList.remove("active");
    }
  });

  // =======================
  // COLOR PICKER
  // =======================
  playlistColors.forEach(dot => {
    dot.style.background = dot.dataset.color;

    dot.addEventListener("click", () => {
      playlistColors.forEach(d => d.classList.remove("active"));
      dot.classList.add("active");

      selectedColor = dot.dataset.color;
    });
  });

  // =======================
  // SAVE PLAYLIST
  // =======================
  function createPlaylist() {
    const name = playlistNameInput.value.trim();
    const date = playlistDateInput.value;
    const time = playlistTimeInput.value;

    if (!name) {
      alert("⚠️ Please enter playlist name!");
      return;
    }

    // prevent duplicate names
    const exists = playlists.some(pl => pl.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert("⚠️ Playlist already exists!");
      return;
    }

    const newPlaylist = {
      id: Date.now(),
      name: name,
      color: selectedColor,
      date: date,
      time: time
    };

    playlists.push(newPlaylist);
    activePlaylist = name;

    savePlaylists();
    renderPlaylists();

    playlistModal.classList.remove("active");

    console.log("✅ Playlist Saved:", newPlaylist);
  }

  savePlaylistBtn.addEventListener("click", createPlaylist);

  // Save playlist when Enter pressed
  playlistNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      createPlaylist();
    }
  });

  // =======================
  // INIT LOAD
  // =======================
  renderPlaylists();

});
// -------- LOG OUT FUNCTION --------
logoutBtn.addEventListener("click", () => {
  // Clear localStorage or session (optional)
  // localStorage.clear(); // uncomment if you want full reset
  alert("✅ You have logged out!");
  
  // Redirect to login page
  window.location.href = "login.html"; // update with your login page URL
});
// =======================
// SETTINGS SYSTEM (ADVANCED)
// =======================

// Elements
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsModal = document.getElementById("closeSettingsModal");

// Open/Close modal
settingsBtn.addEventListener("click", () => settingsModal.classList.add("active"));
closeSettingsModal.addEventListener("click", () => settingsModal.classList.remove("active"));
settingsModal.addEventListener("click", e => {
  if (e.target === settingsModal) settingsModal.classList.remove("active");
});

// Tabs
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Remove active from all
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(tc => tc.classList.remove("active"));

    // Activate clicked tab
    btn.classList.add("active");
    const target = btn.dataset.tab;
    document.getElementById(target).classList.add("active");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // PROFILE SYSTEM
  // =======================
  const profileInputs = {
    name: document.getElementById("settingsProfileName"),
    email: document.getElementById("settingsProfileEmail"),
    phone: document.getElementById("settingsProfilePhone"),
    country: document.getElementById("settingsProfileCountry"),
    bio: document.getElementById("settingsProfileBio"),
    image: document.getElementById("settingsProfilePreview")
  };

  const profileImageInput = document.getElementById("settingsProfileImage");
  const saveProfileBtn = document.getElementById("saveSettingsProfile");

  // Load profile data
  function loadSettingsProfile() {
    const data = JSON.parse(localStorage.getItem("profileData"));
    if (data) {
      profileInputs.name.value = data.name || "";
      profileInputs.email.value = data.email || "";
      profileInputs.phone.value = data.phone || "";
      profileInputs.country.value = data.country || "";
      profileInputs.bio.value = data.bio || "";
      profileInputs.image.src = data.image || "https://i.pravatar.cc/120";
    }
  }

  loadSettingsProfile();

  // Save profile
  saveProfileBtn.addEventListener("click", () => {
    const data = {
      name: profileInputs.name.value,
      email: profileInputs.email.value,
      phone: profileInputs.phone.value,
      country: profileInputs.country.value,
      bio: profileInputs.bio.value,
      image: profileInputs.image.src
    };
    localStorage.setItem("profileData", JSON.stringify(data));
    alert("✅ Profile saved!");
    loadSettingsProfile();
  });

  // Profile image preview
  profileImageInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => profileInputs.image.src = reader.result;
      reader.readAsDataURL(file);
    }
  });
});
// ======================================
// LIGHT & DARK MODE - MASSIVE STYLING JS (PART 1/2)
// ======================================

// THEME VARIABLES - COLORFUL AND STYLISH
const themes = {
    light: {
        '--primary': '#8f7cff',
        '--secondary': '#ffd369',
        '--accent': '#6ee7b7',
        '--dark': '#e2e8f0',
        '--bg': '#ffffff',
        '--text': '#111827',
        '--glass': 'rgba(0,0,0,0.05)',
        '--border': 'rgba(0,0,0,0.15)',
        '--shadow': '0 30px 80px rgba(0,0,0,0.15)',
        '--hover': 'rgba(143,124,255,0.2)',
        '--btn-hover': '#ffd369',
        '--modal-bg': '#f9f9f9',
        '--input-bg': 'rgba(15,23,42,0.05)',
        '--calendar-active': 'rgba(255,211,105,0.25)',
        '--completed-opacity': '0.7',
        '--card-shadow': '0 4px 20px rgba(0,0,0,0.1)',
        '--highlight': '#fcd34d'
    },
    dark: {
        '--primary': '#8f7cff',
        '--secondary': '#ffd369',
        '--accent': '#6ee7b7',
        '--dark': '#0f172a',
        '--bg': '#0b1020',
        '--text': '#f5f5f5',
        '--glass': 'rgba(255,255,255,0.12)',
        '--border': 'rgba(255,255,255,0.25)',
        '--shadow': '0 30px 80px rgba(0,0,0,0.45)',
        '--hover': 'rgba(143,124,255,0.3)',
        '--btn-hover': '#8f7cff',
        '--modal-bg': '#1f2937',
        '--input-bg': 'rgba(255,255,255,0.1)',
        '--calendar-active': 'rgba(143,124,255,0.3)',
        '--completed-opacity': '0.7',
        '--card-shadow': '0 4px 20px rgba(0,0,0,0.5)',
        '--highlight': '#7c3aed'
    }
};

// ======================================
// APPLY ROOT VARIABLES
// ======================================

function applyRoot(theme) {
    const root = document.documentElement;
    for (let key in theme) {
        root.style.setProperty(key, theme[key]);
    }
    document.body.style.background = theme['--bg'];
    document.body.style.color = theme['--text'];
}

// ======================================
// DETAILED ELEMENT STYLING FUNCTION
// ======================================

function applyElements(theme) {
    // Global transitions
    document.querySelectorAll('*').forEach(el => {
        el.style.transition = 'all 0.35s ease-in-out';
        el.style.color = theme['--text'];
    });

    // Body
    document.body.style.background = theme['--bg'];
    document.body.style.color = theme['--text'];
    document.body.style.fontFamily = 'Arial, sans-serif';
    document.body.style.lineHeight = '1.6';

    // Sidebar
    document.querySelectorAll('.sidebar').forEach(sb => {
        sb.style.background = theme['--dark'];
        sb.style.padding = '30px 20px';
        sb.style.display = 'flex';
        sb.style.flexDirection = 'column';
        sb.style.justifyContent = 'space-between';
        sb.style.borderRight = `1px solid ${theme['--border']}`;
        sb.style.boxShadow = `2px 0 10px ${theme['--shadow']}`;
        sb.style.color = theme['--text'];
    });

    // Logo
    document.querySelectorAll('.logo').forEach(logo => {
        logo.style.fontSize = '28px';
        logo.style.fontWeight = 'bold';
        logo.style.color = theme['--secondary'];
        logo.style.textShadow = '1px 1px 4px rgba(0,0,0,0.2)';
        logo.style.marginBottom = '30px';
    });

    // Menu Items
    document.querySelectorAll('.menu li').forEach(li => {
        li.style.padding = '12px 15px';
        li.style.marginBottom = '10px';
        li.style.borderRadius = '12px';
        li.style.cursor = 'pointer';
        li.style.color = theme['--text'];
        li.style.fontWeight = '500';
        li.style.transition = 'all 0.3s';
        li.onmouseenter = () => {
            li.style.background = theme['--hover'];
            li.style.boxShadow = `0 4px 15px ${theme['--shadow']}`;
        };
        li.onmouseleave = () => {
            li.style.background = 'transparent';
            li.style.boxShadow = 'none';
        };
    });

    // Active Menu Item
    document.querySelectorAll('.menu li.active').forEach(li => {
        li.style.background = theme['--primary'];
        li.style.color = '#fff';
        li.style.fontWeight = 'bold';
        li.style.boxShadow = `0 0 20px ${theme['--primary']}`;
    });

    // Calendar Box
    document.querySelectorAll('.calendar-box').forEach(box => {
        box.style.background = theme['--glass'];
        box.style.padding = '15px';
        box.style.borderRadius = '14px';
        box.style.color = theme['--secondary'];
        box.style.fontWeight = 'bold';
        box.style.marginTop = '40px';
        box.style.boxShadow = `0 8px 30px ${theme['--shadow']}`;
    });

    // Calendar Button
    document.querySelectorAll('.cal-btn').forEach(btn => {
        btn.style.background = theme['--primary'];
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.padding = '6px 12px';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = `0 4px 20px ${theme['--shadow']}`;
        btn.onmouseenter = () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.boxShadow = `0 6px 25px ${theme['--shadow']}`;
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = `0 4px 20px ${theme['--shadow']}`;
        };
    });

    // Logout
    document.querySelectorAll('.logout').forEach(el => {
        el.style.color = theme['--text'];
        el.style.textDecoration = 'underline';
        el.style.cursor = 'pointer';
        el.onmouseenter = () => el.style.color = theme['--primary'];
        el.onmouseleave = () => el.style.color = theme['--text'];
    });

    // Main Container
    document.querySelectorAll('.main').forEach(main => {
        main.style.background = `linear-gradient(135deg, ${theme['--dark']}, ${theme['--bg']})`;
        main.style.padding = '40px';
        main.style.borderRadius = '20px';
        main.style.overflowY = 'auto';
        main.style.boxShadow = theme['--shadow'];
        main.style.color = theme['--text'];
    });

    // Header
    document.querySelectorAll('.header h1').forEach(h => {
        h.style.fontSize = '34px';
        h.style.marginBottom = '6px';
        h.style.fontWeight = '700';
        h.style.color = theme['--text'];
        h.style.textShadow = `1px 1px 3px ${theme['--shadow']}`;
    });

    document.querySelectorAll('.header p').forEach(p => {
        p.style.color = theme['--text'];
        p.style.fontWeight = '500';
    });

    // Profile Image
    document.querySelectorAll('.profile img').forEach(img => {
        img.style.width = '48px';
        img.style.height = '48px';
        img.style.borderRadius = '50%';
        img.style.border = `2px solid ${theme['--primary']}`;
        img.style.boxShadow = `0 4px 15px ${theme['--shadow']}`;
    });

    // Task Input
    document.querySelectorAll('.task-input input').forEach(inp => {
        inp.style.flex = '1';
        inp.style.padding = '14px 20px';
        inp.style.borderRadius = '30px';
        inp.style.border = `1px solid ${theme['--border']}`;
        inp.style.outline = 'none';
        inp.style.background = theme['--glass'];
        inp.style.color = theme['--text'];
        inp.style.fontSize = '16px';
        inp.style.boxShadow = `inset 0 2px 8px ${theme['--shadow']}`;
    });

    // Task Buttons
    const buttons = ['#addTaskBtn', '#clockBtn', '.done-btn', '.del-btn', '.set-date-btn', '.save-reminder', '.theme-btn', '.tab-btn'];
    buttons.forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
            btn.style.background = theme['--primary'];
            btn.style.color = '#fff';
            btn.style.borderRadius = '25px';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = '600';
            btn.style.boxShadow = `0 6px 20px ${theme['--shadow']}`;
            btn.style.transition = 'all 0.3s';
            btn.onmouseenter = () => {
                btn.style.background = theme['--btn-hover'];
                btn.style.color = theme['--text'];
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = `0 8px 25px ${theme['--shadow']}`;
            };
            btn.onmouseleave = () => {
                btn.style.background = theme['--primary'];
                btn.style.color = '#fff';
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = `0 6px 20px ${theme['--shadow']}`;
            };
        });
    });

    // Cards
    document.querySelectorAll('.card').forEach(card => {
        card.style.background = theme['--input-bg'];
        card.style.color = theme['--text'];
        card.style.padding = '28px';
        card.style.borderRadius = '20px';
        card.style.boxShadow = theme['--card-shadow'];
        card.style.border = `1px solid ${theme['--border']}`;
        card.style.transition = 'all 0.3s';
        card.onmouseenter = () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = `0 12px 35px ${theme['--shadow']}`;
        };
        card.onmouseleave = () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = theme['--card-shadow'];
        };
    });

    // Progress Bars
    document.querySelectorAll('.progress-bar').forEach(pb => {
        pb.style.width = '100%';
        pb.style.height = '8px';
        pb.style.background = 'rgba(0,0,0,0.1)';
        pb.style.borderRadius = '20px';
        pb.style.overflow = 'hidden';
    });

    document.querySelectorAll('.progress').forEach(pr => {
        pr.style.height = '100%';
        pr.style.width = '30%';
        pr.style.background = theme['--primary'];
        pr.style.borderRadius = '20px';
    });

    // Task Items
    document.querySelectorAll('.task-item').forEach(task => {
        task.style.background = theme['--input-bg'];
        task.style.padding = '18px';
        task.style.borderRadius = '18px';
        task.style.display = 'flex';
        task.style.justifyContent = 'space-between';
        task.style.alignItems = 'center';
        task.style.borderLeft = `6px solid ${theme['--secondary']}`;
        task.style.color = theme['--text'];
        task.style.boxShadow = `0 4px 15px ${theme['--shadow']}`;
    });

    document.querySelectorAll('.task-tag').forEach(tag => {
        tag.style.background = theme['--secondary'];
        tag.style.color = theme['--text'];
        tag.style.fontWeight = 'bold';
        tag.style.padding = '6px 14px';
        tag.style.borderRadius = '20px';
        tag.style.fontSize = '13px';
        tag.style.boxShadow = `0 2px 12px ${theme['--shadow']}`;
    });

    document.querySelectorAll('.task-text, .task-reminder, .completed, .option').forEach(el => {
        el.style.color = theme['--text'];
    });

    document.querySelectorAll('.completed').forEach(comp => {
        comp.style.opacity = theme['--completed-opacity'];
        comp.style.textDecoration = 'line-through';
    });

    // Modals
    document.querySelectorAll('.modal, .modal-content').forEach(modal => {
        modal.style.background = theme['--modal-bg'];
        modal.style.color = theme['--text'];
        modal.style.border = `1px solid ${theme['--border']}`;
        modal.style.boxShadow = `0 10px 35px ${theme['--shadow']}`;
        modal.style.borderRadius = '25px';
        modal.style.padding = '25px';
    });

    // Calendar
    document.querySelectorAll('.day, .calendar-top, .calendar-info').forEach(el => {
        el.style.background = theme['--input-bg'];
        el.style.border = `1px solid ${theme['--border']}`;
        el.style.color = theme['--text'];
        el.style.borderRadius = '12px';
        el.style.transition = 'all 0.25s';
    });

    document.querySelectorAll('.day.active').forEach(active => {
        active.style.background = theme['--calendar-active'];
        active.style.color = theme['--secondary'];
        active.style.fontWeight = 'bold';
        active.style.boxShadow = `0 4px 20px ${theme['--shadow']}`;
    });

    // END OF PART 1 (~500 lines)
}
// ======================================
// LIGHT & DARK MODE - MASSIVE STYLING JS (PART 2/2)
// ======================================

function applyElementsPart2(theme) {
    // Profile Modal
    document.querySelectorAll('.profile-top, .profile-upload label, .profile-form input, .profile-form textarea').forEach(el => {
        el.style.background = theme['--input-bg'];
        el.style.color = theme['--text'];
        el.style.border = `1px solid ${theme['--border']}`;
        el.style.borderRadius = '12px';
        el.style.padding = '10px 14px';
        el.style.transition = 'all 0.3s';
    });

    document.querySelectorAll('.profile-upload label').forEach(label => {
        label.style.cursor = 'pointer';
        label.style.color = theme['--primary'];
        label.onmouseenter = () => label.style.color = theme['--accent'];
        label.onmouseleave = () => label.style.color = theme['--primary'];
    });

    // Tab Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.style.background = theme['--input-bg'];
        btn.style.color = theme['--text'];
        btn.style.border = `1px solid ${theme['--border']}`;
        btn.style.padding = '10px 18px';
        btn.style.borderRadius = '20px';
        btn.style.marginRight = '10px';
        btn.style.cursor = 'pointer';
        btn.style.fontWeight = '600';
        btn.style.transition = 'all 0.3s';
        btn.onmouseenter = () => {
            btn.style.background = theme['--hover'];
            btn.style.color = theme['--text'];
            btn.style.transform = 'translateY(-2px)';
        };
        btn.onmouseleave = () => {
            btn.style.background = theme['--input-bg'];
            btn.style.color = theme['--text'];
            btn.style.transform = 'translateY(0)';
        };
    });

    document.querySelectorAll('.tab-btn.active').forEach(btn => {
        btn.style.background = theme['--primary'];
        btn.style.color = '#fff';
        btn.style.boxShadow = `0 6px 20px ${theme['--shadow']}`;
    });

    // Dropdowns
    document.querySelectorAll('.select-box').forEach(sb => {
        sb.style.background = theme['--input-bg'];
        sb.style.border = `1px solid ${theme['--border']}`;
        sb.style.borderRadius = '30px';
        sb.style.padding = '12px 18px';
        sb.style.display = 'flex';
        sb.style.justifyContent = 'space-between';
        sb.style.alignItems = 'center';
        sb.style.cursor = 'pointer';
        sb.style.color = theme['--text'];
        sb.style.boxShadow = `0 0 15px rgba(143,124,255,0.1)`;
        sb.style.transition = 'all 0.25s';
    });

    document.querySelectorAll('.option').forEach(opt => {
        opt.style.color = theme['--text'];
        opt.style.padding = '12px';
        opt.style.borderRadius = '14px';
        opt.style.cursor = 'pointer';
        opt.style.transition = 'all 0.25s';
        opt.onmouseenter = () => opt.style.background = theme['--hover'];
        opt.onmouseleave = () => opt.style.background = theme['--input-bg'];
    });

    // Buttons Extra Hover
    const extraBtns = ['.done-btn', '.del-btn', '.set-date-btn', '.save-reminder'];
    extraBtns.forEach(sel => {
        document.querySelectorAll(sel).forEach(btn => {
            btn.style.borderRadius = '25px';
            btn.style.fontWeight = '600';
            btn.style.transition = 'all 0.3s';
            btn.onmouseenter = () => {
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = `0 6px 20px ${theme['--shadow']}`;
            };
            btn.onmouseleave = () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            };
        });
    });

    // Cards Extra Styling
    document.querySelectorAll('.card').forEach(card => {
        card.style.transition = 'all 0.4s';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.style.backgroundImage = `linear-gradient(145deg, ${theme['--bg']} 0%, ${theme['--dark']} 100%)`;
        card.style.color = theme['--text'];
    });

    // Shadows & Glow for Highlights
    document.querySelectorAll('.highlight').forEach(el => {
        el.style.color = theme['--highlight'];
        el.style.textShadow = `0 0 8px ${theme['--highlight']}`;
        el.style.transition = 'all 0.35s';
    });

    // Modal Buttons
    document.querySelectorAll('.modal button').forEach(btn => {
        btn.style.background = theme['--primary'];
        btn.style.color = '#fff';
        btn.style.padding = '8px 16px';
        btn.style.borderRadius = '20px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = `0 4px 15px ${theme['--shadow']}`;
        btn.style.transition = 'all 0.3s';
        btn.onmouseenter = () => {
            btn.style.background = theme['--btn-hover'];
            btn.style.transform = 'scale(1.05)';
        };
        btn.onmouseleave = () => {
            btn.style.background = theme['--primary'];
            btn.style.transform = 'scale(1)';
        };
    });

    // Calendar Extra
    document.querySelectorAll('.day, .calendar-info').forEach(el => {
        el.style.transition = 'all 0.25s';
        el.style.borderRadius = '12px';
    });

    // Completed Task Styling
    document.querySelectorAll('.completed').forEach(comp => {
        comp.style.opacity = theme['--completed-opacity'];
        comp.style.textDecoration = 'line-through';
        comp.style.color = theme['--text'];
        comp.style.transition = 'all 0.3s';
    });

    // Footer
    document.querySelectorAll('.footer').forEach(footer => {
        footer.style.background = theme['--dark'];
        footer.style.color = theme['--text'];
        footer.style.padding = '20px 30px';
        footer.style.textAlign = 'center';
        footer.style.fontSize = '14px';
        footer.style.borderTop = `1px solid ${theme['--border']}`;
    });

    // Tooltips
    document.querySelectorAll('.tooltip').forEach(tt => {
        tt.style.background = theme['--secondary'];
        tt.style.color = '#000';
        tt.style.padding = '6px 12px';
        tt.style.borderRadius = '8px';
        tt.style.fontSize = '12px';
        tt.style.transition = 'all 0.3s';
        tt.style.opacity = '0.9';
    });

    // Cards Hover Glow
    document.querySelectorAll('.card').forEach(card => {
        card.onmouseenter = () => {
            card.style.boxShadow = `0 12px 35px ${theme['--shadow']}`;
            card.style.transform = 'translateY(-2px)';
        };
        card.onmouseleave = () => {
            card.style.boxShadow = theme['--card-shadow'];
            card.style.transform = 'translateY(0)';
        };
    });

    // Inputs Focus Glow
    document.querySelectorAll('input, textarea, select').forEach(inp => {
        inp.onfocus = () => {
            inp.style.borderColor = theme['--primary'];
            inp.style.boxShadow = `0 0 12px ${theme['--primary']}`;
        };
        inp.onblur = () => {
            inp.style.borderColor = theme['--border'];
            inp.style.boxShadow = 'none';
        };
    });

    // Animations for Buttons
    const allBtns = document.querySelectorAll('button, .tab-btn, .cal-btn');
    allBtns.forEach(btn => {
        btn.style.transition = 'all 0.35s ease-in-out';
        btn.style.transformOrigin = 'center';
    });

    // Hover Glow for Highlights
    document.querySelectorAll('.highlight').forEach(el => {
        el.onmouseenter = () => {
            el.style.textShadow = `0 0 12px ${theme['--highlight']}`;
            el.style.transform = 'scale(1.05)';
        };
        el.onmouseleave = () => {
            el.style.textShadow = `0 0 8px ${theme['--highlight']}`;
            el.style.transform = 'scale(1)';
        };
    });

    // Apply dynamic elements observer fallback
    const observer = new MutationObserver(() => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        applyElements(themes[currentTheme]);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // END OF PART 2 (~500 lines)
}

// ======================================
// APPLY THEME FUNCTION
// ======================================

function applyTheme(name) {
    const theme = themes[name];
    applyRoot(theme);
    applyElements(theme);
    applyElementsPart2(theme);
    localStorage.setItem('theme', name);
}

// ======================================
// BUTTONS
// ======================================

document.getElementById('lightBtn').addEventListener('click', () => applyTheme('light'));
document.getElementById('darkBtn').addEventListener('click', () => applyTheme('dark'));

// ======================================
// INIT THEME ON LOAD
// ======================================

(function init() {
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);
})();


// =======================
// TO-DO PLAYLISTS
// =======================
const settingsPlaylistContainer = document.getElementById("settingsPlaylistContainer");

function loadPlaylistsInSettings() {
  const playlists = JSON.parse(localStorage.getItem("playlists")) || [];
  settingsPlaylistContainer.innerHTML = "";
  playlists.forEach(pl => {
    const li = document.createElement("li");
    li.textContent = pl.name;
    li.style.padding = "6px 10px";
    li.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
    settingsPlaylistContainer.appendChild(li);
  });
}
loadPlaylistsInSettings();

// =======================
// DAILY REPORT
// =======================
function generateDailyReport() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const total = tasks.length;
  const pending = tasks.filter(t => !t.completed).length;
  const done = tasks.filter(t => t.completed).length;
  const high = tasks.filter(t => t.priority === "High").length;

  const reportText = `
    Total Tasks: ${total}<br>
    Completed: ${done}<br>
    Pending: ${pending}<br>
    High Priority: ${high}
  `;
  document.getElementById("dailyReportText").innerHTML = reportText;
}
generateDailyReport();

// =======================
// AUTO UPDATE DAILY REPORT WHEN TASKS CHANGE
// =======================
window.addEventListener("storage", generateDailyReport);
const title = document.querySelector(".header h1");

document.getElementById("notesBtn").addEventListener("click", () => {
  title.textContent = "Notes";
});

document.getElementById("meetBtn").addEventListener("click", () => {
  title.textContent = "Upcoming Meetings";
});
const menuItems = document.querySelectorAll(".menu li");

menuItems.forEach(item => {
  item.addEventListener("click", () => {
    menuItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const menuBtns = document.querySelectorAll(".menu-btn");
  const mainContent = document.getElementById("mainContent");

  menuBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      menuBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const page = btn.dataset.page;
      loadPage(page);
    });
  });

  // Load Notes page by default
  loadPage("pageNotes");

  function loadPage(page) {
    if (page === "pageNotes") {
      mainContent.innerHTML = getNotesPageHTML();
      initNotesPage();
    } else {
      mainContent.innerHTML = `<h2>${page.replace("page","")} Page Coming Soon</h2>`;
    }
  }

  function getNotesPageHTML() {
    return `
      <div class="pageNotes active">
        <div class="note-container">
          <div class="top-bar">
            <button id="toggleFormBtn">➕ Add Note</button>
            <input type="text" id="searchInput" placeholder="🔍 Search notes..." />
          </div>
          <div class="note-form" id="noteForm">
            <input type="text" id="noteTitle" placeholder="Note Title">
            <textarea id="noteText" placeholder="Write your note..."></textarea>
            <button id="saveNoteBtn">💾 Save Note</button>
          </div>
          <div class="notes" id="notesContainer"></div>
          <p id="emptyMessage">No notes yet. Add your first note! 📌</p>
        </div>
      </div>
    `;
  }

  function initNotesPage() {
    const toggleFormBtn = document.getElementById("toggleFormBtn");
    const noteForm = document.getElementById("noteForm");
    const saveNoteBtn = document.getElementById("saveNoteBtn");
    const notesContainer = document.getElementById("notesContainer");
    const noteTitle = document.getElementById("noteTitle");
    const noteText = document.getElementById("noteText");
    const emptyMessage = document.getElementById("emptyMessage");
    const searchInput = document.getElementById("searchInput");

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let editIndex = null;

    toggleFormBtn.addEventListener("click", () => {
      noteForm.style.display = noteForm.style.display === "block" ? "none" : "block";
    });

    saveNoteBtn.addEventListener("click", () => {
      const title = noteTitle.value.trim();
      const text = noteText.value.trim();
      if (!title || !text) return alert("Enter both title and note!");
      const date = new Date().toLocaleString();

      if (editIndex !== null) {
        notes[editIndex] = { title, text, date };
        editIndex = null;
      } else {
        notes.push({ title, text, date });
      }

      localStorage.setItem("notes", JSON.stringify(notes));
      renderNotes();
      noteForm.style.display = "none";
      noteTitle.value = "";
      noteText.value = "";
    });

    function renderNotes(filter = "") {
      notesContainer.innerHTML = "";
      const filtered = notes.filter(n =>
        n.title.toLowerCase().includes(filter.toLowerCase()) ||
        n.text.toLowerCase().includes(filter.toLowerCase())
      );

      if (filtered.length === 0) emptyMessage.style.display = "block";
      else emptyMessage.style.display = "none";

      filtered.forEach((note,i) => {
        const div = document.createElement("div");
        div.classList.add("note");
        div.innerHTML = `
          <h3>${note.title}</h3>
          <p>${note.text}</p>
          <small>📅 ${note.date}</small>
          <div class="note-actions">
            <button class="edit-btn" data-index="${i}">✏ Edit</button>
            <button class="delete-btn" data-index="${i}">🗑 Delete</button>
          </div>
        `;
        notesContainer.appendChild(div);
      });

      document.querySelectorAll(".edit-btn").forEach(b => {
        b.addEventListener("click", e => {
          const i = e.target.dataset.index;
          noteTitle.value = notes[i].title;
          noteText.value = notes[i].text;
          editIndex = i;
          noteForm.style.display = "block";
        });
      });

      document.querySelectorAll(".delete-btn").forEach(b => {
        b.addEventListener("click", e => {
          const i = e.target.dataset.index;
          if (!confirm("Delete this note?")) return;
          notes.splice(i,1);
          localStorage.setItem("notes", JSON.stringify(notes));
          renderNotes(searchInput.value);
        });
      });
    }

    searchInput.addEventListener("input", () => renderNotes(searchInput.value));
    renderNotes();
  }
});
const mainContent = document.getElementById("mainContent");

const meetingsPageHTML = `
<div class="meetings-page-container">
  <div class="meetings-card">
    <header>📅 Advanced Meetings</header>

    <div class="top-bar">
      <button id="toggleMeetingFormBtn">➕ Add Meeting</button>
      <input type="text" id="searchMeetingInput" placeholder="Search meetings...">
    </div>

    <div class="meeting-form" id="meetingForm">
      <input type="text" id="meetingTitle" placeholder="Meeting Title">
      <input type="datetime-local" id="meetingDateTime">
      <input type="text" id="meetingParticipants" placeholder="Participants (comma-separated)">
      <button id="saveMeetingBtn">💾 Save Meeting</button>
    </div>

    <div class="meetings-grid" id="meetingsContainer"></div>
    <p id="emptyMeetingMessage">No meetings yet. Add your first meeting! 📌</p>
  </div>
</div>
`;
// Menu buttons
const menuNotes = document.getElementById("menuNotes");
const menuMeetings = document.getElementById("menuMeetings");

// Load Notes page (existing Notes JS)
menuNotes.addEventListener("click", (e) => {
  e.preventDefault();
  loadNotesPage();
});

// Load Meetings page
menuMeetings.addEventListener("click", (e) => {
  e.preventDefault();
  loadMeetingsPage();
});

function loadMeetingsPage() {
  mainContent.innerHTML = meetingsPageHTML;
  initMeetingsJS();
}
function initMeetingsJS() {
  const toggleMeetingFormBtn = document.getElementById("toggleMeetingFormBtn");
  const meetingForm = document.getElementById("meetingForm");
  const saveMeetingBtn = document.getElementById("saveMeetingBtn");
  const meetingsContainer = document.getElementById("meetingsContainer");
  const meetingTitle = document.getElementById("meetingTitle");
  const meetingDateTime = document.getElementById("meetingDateTime");
  const meetingParticipants = document.getElementById("meetingParticipants");
  const searchMeetingInput = document.getElementById("searchMeetingInput");
  const emptyMeetingMessage = document.getElementById("emptyMeetingMessage");

  let meetings = JSON.parse(localStorage.getItem("meetings")) || [];
  let editIndex = null;

  // Toggle form
  toggleMeetingFormBtn.addEventListener("click", () => {
    meetingForm.classList.toggle("show");
  });

  // Save meeting
  saveMeetingBtn.addEventListener("click", () => {
    const title = meetingTitle.value.trim();
    const datetime = meetingDateTime.value;
    const participants = meetingParticipants.value.split(",").map(p => p.trim()).filter(p=>p);

    if (!title || !datetime) return alert("Please enter title and date/time!");

    if (editIndex !== null) {
      meetings[editIndex] = { title, datetime, participants };
      editIndex = null;
    } else {
      meetings.push({ title, datetime, participants });
    }

    localStorage.setItem("meetings", JSON.stringify(meetings));
    renderMeetings();
    hideMeetingForm();
  });

  function hideMeetingForm() {
    meetingForm.classList.remove("show");
    meetingTitle.value = meetingDateTime.value = meetingParticipants.value = "";
  }

  // Render meetings
  function renderMeetings(filter = "") {
    meetingsContainer.innerHTML = "";
    const filtered = meetings.filter(m => 
      m.title.toLowerCase().includes(filter.toLowerCase())
      || m.participants.join(",").toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) emptyMeetingMessage.style.display = "block";
    else emptyMeetingMessage.style.display = "none";

    filtered.forEach((m, i) => {
      const div = document.createElement("div");
      div.className = "meeting";
      div.innerHTML = `
        <h3>${m.title}</h3>
        <p>🕒 ${m.datetime}</p>
        <p>👥 ${m.participants.join(", ")}</p>
        <div class="meeting-actions">
          <button class="edit-btn" data-index="${i}">✏ Edit</button>
          <button class="delete-btn" data-index="${i}">🗑 Delete</button>
        </div>
      `;
      meetingsContainer.appendChild(div);
    });

    // Edit & Delete buttons
    document.querySelectorAll(".edit-btn").forEach(btn=>{
      btn.addEventListener("click", e=>{
        const i = e.target.dataset.index;
        const m = meetings[i];
        meetingTitle.value = m.title;
        meetingDateTime.value = m.datetime;
        meetingParticipants.value = m.participants.join(", ");
        editIndex = i;
        meetingForm.classList.add("show");
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn=>{
      btn.addEventListener("click", e=>{
        const i = e.target.dataset.index;
        if(!confirm("Delete this meeting?")) return;
        meetings.splice(i,1);
        localStorage.setItem("meetings", JSON.stringify(meetings));
        renderMeetings(searchMeetingInput.value);
      });
    });
  }

  searchMeetingInput.addEventListener("input", ()=>renderMeetings(searchMeetingInput.value));

  renderMeetings();
}
// =======================
// ADVANCED WEEK CALENDAR SYSTEM
// =======================

const calendarPage = document.getElementById("calendarPage");
const weekTitle = document.getElementById("weekTitle");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");
const addEventBtn = document.getElementById("addEventBtn");

const timeColumn = document.getElementById("timeColumn");
const daysColumn = document.getElementById("daysColumn");

// calendar data
let events = JSON.parse(localStorage.getItem("calendarEvents")) || [];

let currentWeekStart = getStartOfWeek(new Date());

// ---------- SAVE ----------
function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

// ---------- WEEK START ----------
function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // Sunday=0
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.setDate(diff));
}

// ---------- FORMAT DATE ----------
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// ---------- GENERATE TIME LABELS ----------
function renderTimeColumn() {
  timeColumn.innerHTML = "";
  for (let hour = 6; hour <= 22; hour++) {
    const timeBox = document.createElement("div");
    timeBox.className = "time-slot";
    timeBox.textContent = (hour < 10 ? "0" : "") + hour + ":00";
    timeColumn.appendChild(timeBox);
  }
}

// ---------- RENDER WEEK ----------
function renderWeek() {
  daysColumn.innerHTML = "";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(currentWeekStart.getDate() + 6);

  weekTitle.textContent = `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(currentWeekStart.getDate() + i);

    const dayBox = document.createElement("div");
    dayBox.className = "day-col";

    const header = document.createElement("div");
    header.className = "day-header";
    header.innerHTML = `
      <span>${days[i]}</span>
      <small>${dayDate.getDate()}</small>
    `;

    const body = document.createElement("div");
    body.className = "day-body";
    body.dataset.date = dayDate.toDateString();

    // click empty space = add event
    body.addEventListener("click", (e) => {
      if (e.target.classList.contains("event-box")) return;
      openAddEventModal(dayDate);
    });

    dayBox.appendChild(header);
    dayBox.appendChild(body);

    daysColumn.appendChild(dayBox);
  }

  renderEvents();
}

// ---------- RENDER EVENTS ----------
function renderEvents() {
  document.querySelectorAll(".day-body").forEach(body => {
    body.innerHTML = "";
  });

  events.forEach(ev => {
    const dayBody = document.querySelector(`.day-body[data-date="${ev.date}"]`);
    if (!dayBody) return;

    const eventBox = document.createElement("div");
    eventBox.className = "event-box";
    eventBox.style.background = ev.color;

    eventBox.innerHTML = `
      <strong>${ev.title}</strong>
      <small>${ev.time}</small>
    `;

    eventBox.addEventListener("click", (e) => {
      e.stopPropagation();
      const confirmDelete = confirm("Delete this event?");
      if (confirmDelete) {
        events = events.filter(x => x.id !== ev.id);
        saveEvents();
        renderEvents();
      }
    });

    dayBody.appendChild(eventBox);
  });
}

// ---------- ADD EVENT MODAL (prompt version for now) ----------
function openAddEventModal(dateObj) {
  const title = prompt("Event name:");
  if (!title) return;

  const time = prompt("Event time (Example: 09:00 AM):");
  if (!time) return;

  const color = prompt("Color hex (Example: #8f7cff):", "#8f7cff");

  const newEvent = {
    id: Date.now(),
    title: title.trim(),
    time: time.trim(),
    color: color.trim(),
    date: dateObj.toDateString()
  };

  events.push(newEvent);
  saveEvents();
  renderEvents();
}

// ---------- BUTTONS ----------
prevWeekBtn.addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderWeek();
});

nextWeekBtn.addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderWeek();
});

addEventBtn.addEventListener("click", () => {
  openAddEventModal(new Date());
});

// ---------- INIT ----------
renderTimeColumn();
renderWeek();
const rightPanel = document.querySelector(".right-panel");
const rightPanelOverlay = document.getElementById("rightPanelOverlay");
const closeRightPanelBtn = document.getElementById("closeRightPanel");
const openRightPanelBtn = document.getElementById("openRightPanel"); // you need a button somewhere

// Open panel
if(openRightPanelBtn){
  openRightPanelBtn.addEventListener("click", () => {
    rightPanel.classList.add("active");
    rightPanelOverlay.classList.add("active");
  });
}

// Close panel
if(closeRightPanelBtn){
  closeRightPanelBtn.addEventListener("click", () => {
    rightPanel.classList.remove("active");
    rightPanelOverlay.classList.remove("active");
  });
}

// Overlay click
if(rightPanelOverlay){
  rightPanelOverlay.addEventListener("click", () => {
    rightPanel.classList.remove("active");
    rightPanelOverlay.classList.remove("active");
  });
}

function openRightPanel() {
  rightPanel.classList.add('active');
  rightPanelOverlay.style.display = 'block';
}

function closeRightPanel() {
  rightPanel.classList.remove('active');
  rightPanelOverlay.style.display = 'none';
}

document.getElementById('closeRightPanel').addEventListener('click', closeRightPanel);
rightPanelOverlay.addEventListener('click', closeRightPanel);
// Handle custom dropdowns
document.querySelectorAll('.custom-select').forEach(select => {
  const box = select.querySelector('.select-box');
  const options = select.querySelector('.options');
  const selectedText = select.querySelector('.selected-text');

  box.addEventListener('click', () => {
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  });

  options.querySelectorAll('.option').forEach(opt => {
    opt.addEventListener('click', () => {
      selectedText.textContent = opt.dataset.value;
      options.style.display = 'none';
    });
  });
});

// Close dropdowns if clicked outside
document.addEventListener('click', e => {
  if (!e.target.closest('.custom-select')) {
    document.querySelectorAll('.options').forEach(opt => opt.style.display = 'none');
  }
});
