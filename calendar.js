document.addEventListener("DOMContentLoaded", () => {
  console.clear();
  console.log("Calendar.js running ✅");

  // ==========================================================
  // ELEMENTS
  // ==========================================================
  const miniDays = document.getElementById("miniDays");
  const miniMonthTitle = document.getElementById("miniMonthTitle");
  const miniPrev = document.getElementById("miniPrev");
  const miniNext = document.getElementById("miniNext");

  const weekPrev = document.getElementById("weekPrev");
  const weekNext = document.getElementById("weekNext");
  const weekTitle = document.getElementById("weekTitle");

  const daysGrid = document.getElementById("daysGrid");
  const timeCol = document.getElementById("timeCol");

  const eventModal = document.getElementById("eventModal");

  const openEventLeftBtn = document.getElementById("addEventBtn");
  const openEventTopBtn = document.getElementById("addEventBtnTop");
  const closeModalBtn = document.getElementById("closeModal");
  const saveEventBtn = document.getElementById("saveEventBtn");
  const deleteEventBtn = document.getElementById("deleteEvent");
  const nextEventBtn = document.getElementById("nextEvent");

  const eventTitleInput = document.getElementById("eventTitle");
  const eventTimeInput = document.getElementById("eventTime");
  const hiddenDayInput = document.getElementById("eventDay");

  const eventList = document.getElementById("eventList");

  const selectedDay = document.getElementById("selectedDay");
  const dayOptions = document.getElementById("dayOptions");
  const dropdownOptions = document.querySelectorAll(".dropdown-option");

  const eventColors = document.getElementById("eventColors");
  const colorDots = eventColors.querySelectorAll(".color-dot");

  // ==========================================================
  // STATE
  // ==========================================================
  let currentDate = new Date();
  let selectedDate = new Date();
  let selectedDayValue = 0; // Monday
  let selectedColor = "#8f7cff";
  let editingEventId = null;

  // ==========================================================
  // STORAGE
  // ==========================================================
  let savedEvents = JSON.parse(localStorage.getItem("calendarEvents")) || [];
  function saveToStorage() {
    localStorage.setItem("calendarEvents", JSON.stringify(savedEvents));
  }

  // ==========================================================
  // HELPERS
  // ==========================================================
  function isoDate(d) {
    return d.toISOString().split("T")[0];
  }

  function formatShamsi(date) {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function normalizeTime(timeStr) {
    if(!timeStr) return "09:00";
    const [h,m]=timeStr.split(":").map(Number);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  }

  function getDayName(value){
    const names=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    return names[value]||"Monday";
  }

  function openModal() {
    eventModal.classList.add("active");
  }

  function closeModal() {
    eventModal.classList.remove("active");
  }

  function resetModal() {
    eventTitleInput.value="";
    eventTimeInput.value="09:00";
    selectedDayValue=0;
    hiddenDayInput.value="0";
    selectedDay.textContent="Monday";
    editingEventId=null;

    colorDots.forEach(d=>d.classList.remove("active"));
    colorDots[0]?.classList.add("active");
    selectedColor=colorDots[0]?.dataset.color || "#8f7cff";
  }

  // ==========================================================
  // RENDER TIME COLUMN
  // ==========================================================
  function renderTimeColumn() {
    timeCol.innerHTML="";
    for(let h=0;h<24;h++){
      const div=document.createElement("div");
      div.className="time-slot";
      div.textContent=`${String(h).padStart(2,"0")}:00`;
      timeCol.appendChild(div);
    }
  }

  // ==========================================================
  // MINI CALENDAR
  // ==========================================================
  function renderMiniCalendar(){
    miniDays.innerHTML="";
    const year=currentDate.getFullYear();
    const month=currentDate.getMonth();
    miniMonthTitle.textContent=currentDate.toLocaleString("en-US",{month:"long",year:"numeric"});

    const firstDay=new Date(year,month,1);
    const lastDay=new Date(year,month+1,0);
    let startDay=firstDay.getDay()-1;
    if(startDay<0) startDay=6;

    for(let i=0;i<startDay;i++){
      const empty=document.createElement("div");
      empty.className="mini-day empty";
      miniDays.appendChild(empty);
    }

    for(let day=1;day<=lastDay.getDate();day++){
      const date=new Date(year,month,day);
      const div=document.createElement("div");
      div.className="mini-day";
      div.textContent=day;

      if(date.toDateString()===new Date().toDateString()) div.classList.add("today");
      if(date.toDateString()===selectedDate.toDateString()) div.classList.add("active");

      div.addEventListener("click",()=>{
        selectedDate=date;
        renderMiniCalendar();
        renderWeek();
        renderSidebarEvents();
      });

      miniDays.appendChild(div);
    }
  }

  // ==========================================================
  // WEEK TITLE
  // ==========================================================
  function renderWeekTitle(weekStart){
    const weekEnd=new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate()+6);
    const startText=weekStart.toLocaleString("en-US",{month:"short",day:"2-digit"});
    const endText=weekEnd.toLocaleString("en-US",{month:"short",day:"2-digit"});
    weekTitle.textContent=`${startText} - ${endText} ${weekStart.getFullYear()}`;
  }

  // ==========================================================
  // WEEK GRID
  // ==========================================================
  function renderWeek(){
    daysGrid.innerHTML="";
    const weekStart=getWeekStart(selectedDate);
    renderWeekTitle(weekStart);

    for(let i=0;i<7;i++){
      const dayDate=new Date(weekStart);
      dayDate.setDate(weekStart.getDate()+i);

      const col=document.createElement("div");
      col.className="day-column";

      const header=document.createElement("div");
      header.className="day-header";
      header.innerHTML=`
        <h4>${dayDate.toLocaleString("en-US",{weekday:"short"})}</h4>
        <p>${dayDate.getDate()}</p>
        <small>${formatShamsi(dayDate)}</small>
      `;
      col.appendChild(header);

      const slots=document.createElement("div");
      slots.className="day-slots";

      for(let h=0;h<24;h++){
        const slot=document.createElement("div");
        slot.className="hour-slot";
        slot.dataset.date=isoDate(dayDate);
        slot.dataset.hour=h;

        slot.addEventListener("click",()=>{
          resetModal();
          selectedDayValue=i;
          hiddenDayInput.value=String(i);
          selectedDay.textContent=getDayName(i);
          eventTimeInput.value=`${String(h).padStart(2,"0")}:00`;
          openModal();
        });

        slots.appendChild(slot);
      }

      col.appendChild(slots);
      daysGrid.appendChild(col);
    }

    renderGridEvents();
  }

  // ==========================================================
  // GRID EVENTS
  // ==========================================================
  function renderGridEvents(){
    document.querySelectorAll(".event-block").forEach(el=>el.remove());
    const weekStart=getWeekStart(selectedDate);
    const weekEnd=new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate()+6);

    savedEvents.forEach(ev=>{
      const evDate=new Date(ev.date);
      if(evDate<weekStart||evDate>weekEnd) return;
      const startHour=parseInt(ev.time.split(":")[0],10);
      const slot=document.querySelector(`.hour-slot[data-date="${ev.date}"][data-hour="${startHour}"]`);
      if(!slot) return;

      const block=document.createElement("div");
      block.className="event-block";
      block.style.background=ev.color;
      block.innerHTML=`
        <strong>${ev.title}</strong>
        <small>${ev.time}</small>
        <button class="delete-event">✕</button>
      `;

      block.querySelector(".delete-event").addEventListener("click",(e)=>{
        e.stopPropagation();
        savedEvents=savedEvents.filter(x=>x.id!==ev.id);
        saveToStorage();
        renderGridEvents();
        renderSidebarEvents();
      });

      block.addEventListener("click",(e)=>{
        e.stopPropagation();
        openEditEvent(ev);
      });

      slot.appendChild(block);
    });
  }

  // ==========================================================
  // SIDEBAR EVENTS
  // ==========================================================
  function renderSidebarEvents(){
    eventList.innerHTML="";
    const todayKey=isoDate(selectedDate);
    const todayEvents=savedEvents.filter(ev=>ev.date===todayKey);

    if(todayEvents.length===0){
      const p=document.createElement("p");
      p.style.color="#999";
      p.textContent="No events for today.";
      eventList.appendChild(p);
      return;
    }

    todayEvents.sort((a,b)=>parseInt(a.time.split(":")[0])-parseInt(b.time.split(":")[0]));

    todayEvents.forEach(ev=>{
      const card=document.createElement("div");
      card.className="event-card";
      card.innerHTML=`
        <div>
          <h4>${ev.title}</h4>
          <p>${ev.time}</p>
          <small>${formatShamsi(selectedDate)}</small>
        </div>
        <button class="delete-event">✕</button>
      `;
      card.querySelector(".delete-event").addEventListener("click",()=>{
        savedEvents=savedEvents.filter(x=>x.id!==ev.id);
        saveToStorage();
        renderGridEvents();
        renderSidebarEvents();
      });
      card.addEventListener("click",()=>{openEditEvent(ev);});
      eventList.appendChild(card);
    });
  }

  // ==========================================================
  // EDIT EVENT
  // ==========================================================
  function openEditEvent(ev){
    resetModal();
    editingEventId=ev.id;
    eventTitleInput.value=ev.title;
    eventTimeInput.value=ev.time;

    const weekStart=getWeekStart(selectedDate);
    const evDate=new Date(ev.date);
    let diffDays=Math.round((evDate-weekStart)/(1000*60*60*24));
    diffDays=clamp(diffDays,0,6);

    selectedDayValue=diffDays;
    hiddenDayInput.value=String(diffDays);
    selectedDay.textContent=getDayName(diffDays);

    selectedColor=ev.color;
    colorDots.forEach(d=>d.classList.remove("active"));
    colorDots.forEach(d=>{if(d.dataset.color===ev.color)d.classList.add("active");});

    openModal();
  }

  // ==========================================================
  // COLOR PICKER
  // ==========================================================
  colorDots.forEach(dot=>{
    dot.addEventListener("click",()=>{
      colorDots.forEach(d=>d.classList.remove("active"));
      dot.classList.add("active");
      selectedColor=dot.dataset.color;
    });
  });

  // ==========================================================
  // DROPDOWN DAY
  // ==========================================================
  selectedDay.addEventListener("click",e=>{
    e.stopPropagation();
    dayOptions.style.display=dayOptions.style.display==="flex"?"none":"flex";
  });
  dropdownOptions.forEach(opt=>{
    opt.addEventListener("click",e=>{
      e.stopPropagation();
      selectedDayValue=Number(opt.dataset.value);
      selectedDay.textContent=opt.textContent;
      dropdownOptions.forEach(o=>o.classList.remove("active"));
      opt.classList.add("active");
      dayOptions.style.display="none";
    });
  });
  document.addEventListener("click",()=>{dayOptions.style.display="none";});

  // ==========================================================
  // MODAL BUTTONS
  // ==========================================================
  function openNewEventModal(){resetModal();openModal();}
  if(openEventLeftBtn) openEventLeftBtn.addEventListener("click",openNewEventModal);
  if(openEventTopBtn) openEventTopBtn.addEventListener("click",openNewEventModal);
  closeModalBtn.addEventListener("click",closeModal);
  window.addEventListener("click",e=>{if(e.target===eventModal)closeModal();});

  // ==========================================================
  // SAVE EVENT BUTTON
  // ==========================================================
  saveEventBtn.addEventListener("click",()=>{
    const title=eventTitleInput.value.trim();
    const time=normalizeTime(eventTimeInput.value);
    if(!title||!time){alert("Enter Title & Time!");return;}

    const weekStart=getWeekStart(selectedDate);
    const evDate=new Date(weekStart);
    evDate.setDate(weekStart.getDate()+selectedDayValue);
    evDate.setHours(0,0,0,0);

    if(editingEventId){
      const idx=savedEvents.findIndex(ev=>ev.id===editingEventId);
      if(idx!==-1){
        savedEvents[idx].title=title;
        savedEvents[idx].time=time;
        savedEvents[idx].date=isoDate(evDate);
        savedEvents[idx].color=selectedColor;
      }
    } else {
      const newEvent={id:Date.now(),title,date:isoDate(evDate),time,color:selectedColor};
      savedEvents.push(newEvent);
    }

    saveToStorage();
    closeModal();
    resetModal();
    renderWeek();
    renderSidebarEvents();
  });

  // ==========================================================
  // DELETE EVENT BUTTON
  // ==========================================================
  deleteEventBtn.addEventListener("click",()=>{
    if(!editingEventId){alert("No event selected");return;}
    savedEvents=savedEvents.filter(ev=>ev.id!==editingEventId);
    saveToStorage();
    closeModal();
    resetModal();
    renderWeek();
    renderSidebarEvents();
  });

  // ==========================================================
  // NEXT BUTTON
  // ==========================================================
  nextEventBtn.addEventListener("click",()=>{
    let [hour,min]=eventTimeInput.value.split(":").map(Number);
    hour=(hour+1)%24;
    eventTimeInput.value=`${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
  });

  // ==========================================================
  // WEEK NAVIGATION
  // ==========================================================
  weekPrev.addEventListener("click",()=>{
    selectedDate.setDate(selectedDate.getDate()-7);
    renderMiniCalendar();
    renderWeek();
    renderSidebarEvents();
  });
  weekNext.addEventListener("click",()=>{
    selectedDate.setDate(selectedDate.getDate()+7);
    renderMiniCalendar();
    renderWeek();
    renderSidebarEvents();
  });

  // ==========================================================
  // MINI MONTH NAVIGATION
  // ==========================================================
  miniPrev.addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()-1);renderMiniCalendar();});
  miniNext.addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()+1);renderMiniCalendar();});

  // ==========================================================
  // INITIAL RENDER
  // ==========================================================
  renderTimeColumn();
  renderMiniCalendar();
  renderWeek();
  renderSidebarEvents();

});
document.addEventListener('DOMContentLoaded', () => {
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskModal = document.getElementById('taskModal');
  const closeModal = document.getElementById('closeModal');
  const saveTaskBtn = document.getElementById('saveTaskBtn');
  const taskContainer = document.getElementById('taskContainer');
  const taskCount = document.getElementById('taskCount');
  const taskTitleInput = document.getElementById('taskTitle');
  const taskInfoInput = document.getElementById('taskInfo');

  // Open modal
  addTaskBtn.addEventListener('click', () => {
    taskModal.classList.add('active');
    taskTitleInput.value = '';
    taskInfoInput.value = '';
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    taskModal.classList.remove('active');
  });

  // Save task
  saveTaskBtn.addEventListener('click', () => {
    const title = taskTitleInput.value.trim();
    const info = taskInfoInput.value.trim();

    if (!title) {
      alert('Task title is required!');
      return;
    }

    // Create task element
    const taskBox = document.createElement('div');
    taskBox.classList.add('event-card'); // uses your CSS styling

    taskBox.innerHTML = `
      <div>
        <strong>${title}</strong>
        <small>${info}</small>
      </div>
      <button class="delete-task">&times;</button>
    `;

    // Delete functionality
    taskBox.querySelector('.delete-task').addEventListener('click', () => {
      taskBox.remove();
      updateCount();
    });

    taskContainer.appendChild(taskBox);
    updateCount();

    // Close modal
    taskModal.classList.remove('active');
  });

  function updateCount() {
    taskCount.textContent = taskContainer.children.length;
  }

  updateCount();
});
// Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeTaskModal = document.getElementById('closeTaskModal');
const saveTaskBtn = document.getElementById('saveTaskBtn');

const taskTitleInput = document.getElementById('taskTitle');
const taskInfoInput = document.getElementById('taskInfo');

const taskDisplay = document.getElementById('taskDisplay');
const taskCount = document.getElementById('taskCount');

// Open modal
addTaskBtn.addEventListener('click', () => {
  taskModal.classList.add('active');
});

// Close modal
closeTaskModal.addEventListener('click', () => {
  taskModal.classList.remove('active');
});

// Save Task
saveTaskBtn.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  const info = taskInfoInput.value.trim();

  if (!title) {
    alert('Please enter a task title!');
    return;
  }

  // Create task card
  const taskCard = document.createElement('div');
  taskCard.className = 'task-card';
  taskCard.innerHTML = `
    <h3>${title}</h3>
    <p>${info || 'No details provided'}</p>
  `;

  // Append task to display
  taskDisplay.appendChild(taskCard);

  // Update task count
  taskCount.textContent = taskDisplay.children.length;

  // Reset modal
  taskTitleInput.value = '';
  taskInfoInput.value = '';
  taskModal.classList.remove('active');
});
// 🔹 Persistent storage
const savedGridEvents = JSON.parse(localStorage.getItem('advancedGridEvents')) || {};

// 🔹 Grid elements
const dayHeaders = document.getElementById('dayHeaders');
const timeColumn = document.getElementById('timeColumn');
const daysColumns = document.getElementById('daysColumns');

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const hours = 24;

// 🔹 Modal elements
const gridModal = document.getElementById('gridEventModal');
const gridInput = document.getElementById('gridEventInput');
const saveBtn = document.getElementById('saveGridEvent');
const deleteBtn = document.getElementById('deleteGridEvent');
const closeBtn = document.getElementById('closeGridModal');

let activeSlotKey = null; // Keep track of clicked cell

// 🔹 1️⃣ Generate day headers
days.forEach(day => {
  const div = document.createElement('div');
  div.classList.add('day-header');
  div.textContent = day;
  dayHeaders.appendChild(div);
});

// 🔹 2️⃣ Generate time column
for (let h = 0; h < hours; h++){
  const div = document.createElement('div');
  div.classList.add('time-slot');
  div.textContent = `${h}:00`;
  timeColumn.appendChild(div);
}

// 🔹 3️⃣ Generate day columns with hour slots
days.forEach(day => {
  const col = document.createElement('div');
  col.classList.add('day-column');

  for (let h = 0; h < hours; h++){
    const slot = document.createElement('div');
    slot.classList.add('hour-slot');
    slot.dataset.key = `${day}-${h}`;

    const key = slot.dataset.key;
    if (savedGridEvents[key]) {
      createEventDiv(slot, savedGridEvents[key]);
    }

    // Click opens modal
    slot.addEventListener('click', () => {
      activeSlotKey = key;
      gridInput.value = savedGridEvents[key] || '';
      gridModal.style.display = 'block';
      gridInput.focus();
    });

    col.appendChild(slot);
  }

  daysColumns.appendChild(col);
});

// 🔹 4️⃣ Modal button actions
saveBtn.addEventListener('click', () => {
  if (!activeSlotKey) return;
  const value = gridInput.value.trim();
  const slot = document.querySelector(`.hour-slot[data-key="${activeSlotKey}"]`);

  if (value === '') {
    delete savedGridEvents[activeSlotKey];
    slot.innerHTML = '';
  } else {
    savedGridEvents[activeSlotKey] = value;
    createEventDiv(slot, value);
  }

  localStorage.setItem('advancedGridEvents', JSON.stringify(savedGridEvents));
  gridModal.style.display = 'none';
});

deleteBtn.addEventListener('click', () => {
  if (!activeSlotKey) return;
  const slot = document.querySelector(`.hour-slot[data-key="${activeSlotKey}"]`);
  delete savedGridEvents[activeSlotKey];
  slot.innerHTML = '';
  localStorage.setItem('advancedGridEvents', JSON.stringify(savedGridEvents));
  gridModal.style.display = 'none';
});

closeBtn.addEventListener('click', () => {
  gridModal.style.display = 'none';
});

// 🔹 Helper to create event div inside a slot
function createEventDiv(slot, text) {
  slot.innerHTML = '';
  const div = document.createElement('div');
  div.classList.add('grid-event');
  div.textContent = text;
  slot.appendChild(div);
}

// 🔹 Optional: close modal if click outside content
window.addEventListener('click', (e) => {
  if (e.target === gridModal) {
    gridModal.style.display = 'none';
  }
});
// ==========================================================
// MINI MONTH NAVIGATION (LIVE)
// ==========================================================
miniPrev.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  selectedDate = new Date(currentDate); // sync selectedDate
  renderMiniCalendar();
  renderWeek();
  renderSidebarEvents();
});

miniNext.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  selectedDate = new Date(currentDate); // sync selectedDate
  renderMiniCalendar();
  renderWeek();
  renderSidebarEvents();
});

// ==========================================================
// WEEK NAVIGATION (LIVE)
// ==========================================================
weekPrev.addEventListener("click", () => {
  selectedDate.setDate(selectedDate.getDate() - 7);
  currentDate = new Date(selectedDate); // sync month highlight
  renderMiniCalendar();
  renderWeek();
  renderSidebarEvents();
});

weekNext.addEventListener("click", () => {
  selectedDate.setDate(selectedDate.getDate() + 7);
  currentDate = new Date(selectedDate); // sync month highlight
  renderMiniCalendar();
  renderWeek();
  renderSidebarEvents();
});
document.addEventListener("DOMContentLoaded", () => {
  console.clear();
  console.log("Advanced Calendar JS running ✅");

  // ==========================================================
  // ELEMENTS
  // ==========================================================
  const weekPrev = document.getElementById("weekPrev");
  const weekNext = document.getElementById("weekNext");
  const weekTitle = document.getElementById("weekTitle");

  const miniDays = document.getElementById("miniDays");
  const miniMonthTitle = document.getElementById("miniMonthTitle");
  const miniPrev = document.getElementById("miniPrev");
  const miniNext = document.getElementById("miniNext");

  const dayHeadersContainer = document.getElementById("dayHeaders");
  const timeColumn = document.getElementById("timeColumn");
  const daysColumns = document.getElementById("daysColumns");

  const gridModal = document.getElementById("gridEventModal");
  const gridInput = document.getElementById("gridEventInput");
  const saveBtn = document.getElementById("saveGridEvent");
  const deleteBtn = document.getElementById("deleteGridEvent");
  const closeBtn = document.getElementById("closeGridModal");

  // ==========================================================
  // STATE
  // ==========================================================
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const hours = 24;
  let currentDate = new Date();
  let selectedDate = new Date();
  let activeSlotKey = null;

  // ==========================================================
  // STORAGE
  // ==========================================================
  const savedGridEvents = JSON.parse(localStorage.getItem("advancedGridEvents")) || {};

  function saveToStorage() {
    localStorage.setItem("advancedGridEvents", JSON.stringify(savedGridEvents));
  }

  // ==========================================================
  // HELPERS
  // ==========================================================
  function getWeekStart(date){
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday start
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  }

  function isoDate(d){
    return d.toISOString().split("T")[0];
  }

  function formatShamsi(date){
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  // ==========================================================
  // MINI CALENDAR
  // ==========================================================
  function renderMiniCalendar(){
    miniDays.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    miniMonthTitle.textContent = currentDate.toLocaleString("en-US",{month:"long",year:"numeric"});

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month+1,0);
    let startDay = firstDay.getDay() - 1;
    if(startDay < 0) startDay = 6;

    for(let i=0;i<startDay;i++){
      const empty = document.createElement("div");
      empty.className = "mini-day empty";
      miniDays.appendChild(empty);
    }

    for(let d=1; d<=lastDay.getDate(); d++){
      const date = new Date(year, month, d);
      const div = document.createElement("div");
      div.className = "mini-day";
      div.textContent = d;

      if(date.toDateString() === new Date().toDateString()) div.classList.add("today");
      if(date.toDateString() === selectedDate.toDateString()) div.classList.add("active");

      div.addEventListener("click", ()=>{
        selectedDate = date;
        currentDate = new Date(date);
        renderMiniCalendar();
        renderWeekTitle();
        renderWeekGrid();
      });

      miniDays.appendChild(div);
    }
  }

  miniPrev.addEventListener("click", ()=>{
    currentDate.setMonth(currentDate.getMonth()-1);
    renderMiniCalendar();
  });
  miniNext.addEventListener("click", ()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderMiniCalendar();
  });

  // ==========================================================
  // WEEK TITLE
  // ==========================================================
  function renderWeekTitle(){
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate()+6);
    weekTitle.textContent = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  }

  weekPrev.addEventListener("click", ()=>{
    selectedDate.setDate(selectedDate.getDate()-7);
    currentDate = new Date(selectedDate);
    renderWeekTitle();
    renderWeekGrid();
    renderMiniCalendar();
  });
  weekNext.addEventListener("click", ()=>{
    selectedDate.setDate(selectedDate.getDate()+7);
    currentDate = new Date(selectedDate);
    renderWeekTitle();
    renderWeekGrid();
    renderMiniCalendar();
  });

  // ==========================================================
  // TIME COLUMN
  // ==========================================================
  function renderTimeColumn(){
    timeColumn.innerHTML = "";
    for(let h=0; h<hours; h++){
      const div = document.createElement("div");
      div.className = "time-slot";
      div.textContent = `${String(h).padStart(2,"0")}:00`;
      timeColumn.appendChild(div);
    }
  }

  // ==========================================================
  // DAY HEADERS
  // ==========================================================
  function renderDayHeaders(){
    dayHeadersContainer.innerHTML = "";
    days.forEach(d=>{
      const div = document.createElement("div");
      div.className = "day-header";
      div.textContent = d;
      dayHeadersContainer.appendChild(div);
    });
  }

  // ==========================================================
  // GRID
  // ==========================================================
  function createEventDiv(slot, text){
    slot.innerHTML = "";
    const div = document.createElement("div");
    div.className = "grid-event";
    div.textContent = text;
    slot.appendChild(div);
  }

  function createGridSlot(day, hour){
    const slot = document.createElement("div");
    slot.className = "hour-slot";
    slot.dataset.key = `${day}-${hour}`;

    const key = slot.dataset.key;
    if(savedGridEvents[key]) createEventDiv(slot, savedGridEvents[key]);

    slot.addEventListener("click", ()=>{
      activeSlotKey = key;
      gridInput.value = savedGridEvents[key] || "";
      gridModal.style.display = "block";
      gridInput.focus();
    });

    return slot;
  }

  function renderWeekGrid(){
    daysColumns.innerHTML = "";
    const weekStart = getWeekStart(selectedDate);

    days.forEach((dayName,i)=>{
      const col = document.createElement("div");
      col.className = "day-column";

      for(let h=0; h<hours; h++){
        const slot = createGridSlot(dayName, h);
        col.appendChild(slot);
      }

      daysColumns.appendChild(col);
    });
  }

  // ==========================================================
  // MODAL BUTTONS
  // ==========================================================
  saveBtn.addEventListener("click", ()=>{
    if(!activeSlotKey) return;
    const val = gridInput.value.trim();
    const slot = document.querySelector(`.hour-slot[data-key="${activeSlotKey}"]`);
    if(val === ""){
      delete savedGridEvents[activeSlotKey];
      slot.innerHTML = "";
    } else {
      savedGridEvents[activeSlotKey] = val;
      createEventDiv(slot, val);
    }
    saveToStorage();
    gridModal.style.display = "none";
  });

  deleteBtn.addEventListener("click", ()=>{
    if(!activeSlotKey) return;
    const slot = document.querySelector(`.hour-slot[data-key="${activeSlotKey}"]`);
    delete savedGridEvents[activeSlotKey];
    slot.innerHTML = "";
    saveToStorage();
    gridModal.style.display = "none";
  });

  closeBtn.addEventListener("click", ()=>{ gridModal.style.display = "none"; });
  window.addEventListener("click",(e)=>{
    if(e.target === gridModal) gridModal.style.display = "none";
  });

  // ==========================================================
  // INITIAL RENDER
  // ==========================================================
  renderTimeColumn();
  renderDayHeaders();
  renderMiniCalendar();
  renderWeekTitle();
  renderWeekGrid();
});
// ==========================================================
// LEFT PANEL EVENTS (LIKE TASK SYSTEM)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  const addEventBtn = document.getElementById("addEventBtn");
  const eventList = document.getElementById("eventList");

  // Modal Elements (Your Grid Modal)
  const gridEventModal = document.getElementById("gridEventModal");
  const gridEventInput = document.getElementById("gridEventInput");

  const saveGridEvent = document.getElementById("saveGridEvent");
  const deleteGridEvent = document.getElementById("deleteGridEvent");
  const cancelGridEvent = document.getElementById("cancelGridEvent");
  const closeGridModal = document.getElementById("closeGridModal");

  // Storage
  const EVENT_STORAGE_KEY = "savedLeftEvents";
  let savedLeftEvents = JSON.parse(localStorage.getItem(EVENT_STORAGE_KEY)) || [];

  let editingEventId = null;

  // ==========================================================
  // FUNCTIONS
  // ==========================================================
  function saveEventsToStorage() {
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(savedLeftEvents));
  }

  function openEventModal() {
    gridEventModal.classList.add("active");
    gridEventInput.focus();
  }

  function closeEventModal() {
    gridEventModal.classList.remove("active");
    gridEventInput.value = "";
    editingEventId = null;
  }

  function renderLeftEvents() {
    eventList.innerHTML = "";

    if (savedLeftEvents.length === 0) {
      eventList.innerHTML = `<p style="color:#999;font-size:13px;">No saved events</p>`;
      return;
    }

    savedLeftEvents.forEach((ev) => {
      const card = document.createElement("div");
      card.className = "event-card";

      card.innerHTML = `
        <div class="event-card-info">
          <h4>${ev.title}</h4>
          <small>${ev.date}</small>
        </div>
        <button class="delete-event">✕</button>
      `;

      // Delete Button
      card.querySelector(".delete-event").addEventListener("click", (e) => {
        e.stopPropagation();
        savedLeftEvents = savedLeftEvents.filter((x) => x.id !== ev.id);
        saveEventsToStorage();
        renderLeftEvents();
      });

      // Edit on Click
      card.addEventListener("click", () => {
        editingEventId = ev.id;
        gridEventInput.value = ev.title;
        openEventModal();
      });

      eventList.appendChild(card);
    });
  }

  // ==========================================================
  // OPEN MODAL (LEFT BUTTON)
  // ==========================================================
  addEventBtn.addEventListener("click", () => {
    editingEventId = null;
    gridEventInput.value = "";
    openEventModal();
  });

  // ==========================================================
  // SAVE EVENT
  // ==========================================================
  saveGridEvent.addEventListener("click", () => {
    const title = gridEventInput.value.trim();

    if (!title) {
      alert("Please enter an event!");
      return;
    }

    const dateText = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    // Edit Mode
    if (editingEventId) {
      const index = savedLeftEvents.findIndex((x) => x.id === editingEventId);

      if (index !== -1) {
        savedLeftEvents[index].title = title;
        saveEventsToStorage();
      }

    } else {
      // Add New Event
      savedLeftEvents.push({
        id: Date.now(),
        title: title,
        date: dateText
      });

      saveEventsToStorage();
    }

    renderLeftEvents();
    closeEventModal();
  });

  // ==========================================================
  // DELETE EVENT (FROM MODAL)
  // ==========================================================
  deleteGridEvent.addEventListener("click", () => {

    if (!editingEventId) {
      gridEventInput.value = "";
      closeEventModal();
      return;
    }

    savedLeftEvents = savedLeftEvents.filter((x) => x.id !== editingEventId);
    saveEventsToStorage();
    renderLeftEvents();
    closeEventModal();
  });

  // ==========================================================
  // CLOSE BUTTONS
  // ==========================================================
  cancelGridEvent.addEventListener("click", closeEventModal);
  closeGridModal.addEventListener("click", closeEventModal);

  window.addEventListener("click", (e) => {
    if (e.target === gridEventModal) closeEventModal;
  });

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================
  renderLeftEvents();

});
document.addEventListener("DOMContentLoaded", () => {

  // ==============================
  // GRID STORAGE
  // ==============================
  let savedGridEvents = JSON.parse(localStorage.getItem("advancedGridEvents")) || {};

  // ==============================
  // GRID ELEMENTS
  // ==============================
  const dayHeaders = document.getElementById("dayHeaders");
  const timeColumn = document.getElementById("timeColumn");
  const daysColumns = document.getElementById("daysColumns");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = 24;

  // ==============================
  // MODAL ELEMENTS
  // ==============================
  const gridModal = document.getElementById("gridEventModal");
  const gridInput = document.getElementById("gridEventInput");

  const saveBtn = document.getElementById("saveGridEvent");
  const deleteBtn = document.getElementById("deleteGridEvent");
  const cancelBtn = document.getElementById("cancelGridEvent");
  const closeBtn = document.getElementById("closeGridModal");

  const gridSavedText = document.getElementById("gridSavedText");

  // ==============================
  // ACTIVE CELL TRACK
  // ==============================
  let activeSlotKey = null;

  // ==============================
  // CREATE HEADER DAYS
  // ==============================
  dayHeaders.innerHTML = "";
  days.forEach(day => {
    const div = document.createElement("div");
    div.classList.add("day-header");
    div.textContent = day;
    dayHeaders.appendChild(div);
  });

  // ==============================
  // CREATE TIME COLUMN
  // ==============================
  timeColumn.innerHTML = "";
  for (let h = 0; h < hours; h++) {
    const div = document.createElement("div");
    div.classList.add("time-slot");
    div.textContent = `${String(h).padStart(2, "0")}:00`;
    timeColumn.appendChild(div);
  }

  // ==============================
  // CREATE GRID CELLS
  // ==============================
  daysColumns.innerHTML = "";

  days.forEach(day => {
    const col = document.createElement("div");
    col.classList.add("day-column");

    for (let h = 0; h < hours; h++) {
      const slot = document.createElement("div");
      slot.classList.add("hour-slot");

      const key = `${day}-${h}`;
      slot.dataset.key = key;

      // If saved, render it
      if (savedGridEvents[key]) {
        createEventDiv(slot, savedGridEvents[key]);
      }

      // Open modal on click
      slot.addEventListener("click", () => {
        activeSlotKey = key;

        const existingValue = savedGridEvents[key] || "";

        gridInput.value = existingValue;

        if (gridSavedText) {
          gridSavedText.textContent = existingValue || "No event saved";
        }

        openModal();
      });

      col.appendChild(slot);
    }

    daysColumns.appendChild(col);
  });

  // ==============================
  // MODAL FUNCTIONS
  // ==============================
  function openModal() {
    gridModal.style.display = "flex";
    setTimeout(() => {
      gridModal.classList.add("active");
    }, 10);

    gridInput.focus();
  }

  function closeModal() {
    gridModal.classList.remove("active");
    setTimeout(() => {
      gridModal.style.display = "none";
    }, 150);

    activeSlotKey = null;
  }

  // ==============================
  // SAVE EVENT BUTTON
  // ==============================
  saveBtn.addEventListener("click", () => {
    if (!activeSlotKey) return;

    const value = gridInput.value.trim();
    const slot = document.querySelector(`.hour-slot[data-key="${activeSlotKey}"]`);

    if (!slot) return;

    if (value === "") {
      delete savedGridEvents[activeSlotKey];
      slot.innerHTML = "";
    } else {
      savedGridEvents[activeSlotKey] = value;
      createEventDiv(slot, value);
    }

    localStorage.setItem("advancedGridEvents", JSON.stringify(savedGridEvents));

    if (gridSavedText) {
      gridSavedText.textContent = value || "No event saved";
    }

    closeModal();
  });

  // ==============================
  // DELETE EVENT BUTTON
  // ==============================
  deleteBtn.addEventListener("click", () => {
    if (!activeSlotKey) return;

    const slot = document.querySelector(`.hour-slot[data-key="${activeSlotKey}"]`);
    if (!slot) return;

    delete savedGridEvents[activeSlotKey];
    slot.innerHTML = "";

    localStorage.setItem("advancedGridEvents", JSON.stringify(savedGridEvents));

    if (gridSavedText) {
      gridSavedText.textContent = "No event saved";
    }

    closeModal();
  });

  // ==============================
  // CANCEL BUTTON
  // ==============================
  cancelBtn.addEventListener("click", () => {
    closeModal();
  });

  // ==============================
  // CLOSE BUTTON (X)
  // ==============================
  closeBtn.addEventListener("click", () => {
    closeModal();
  });

  // ==============================
  // CLICK OUTSIDE MODAL CLOSE
  // ==============================
  window.addEventListener("click", (e) => {
    if (e.target === gridModal) {
      closeModal();
    }
  });

  // ==============================
  // HELPER: CREATE EVENT DIV
  // ==============================
  function createEventDiv(slot, text) {
    slot.innerHTML = "";

    const div = document.createElement("div");
    div.classList.add("grid-event");
    div.textContent = text;

    slot.appendChild(div);
  }

});
// ==============================
// LEFT PANEL EVENT LIST SYSTEM
// ==============================

const eventModal = document.getElementById("eventModal");
const addEventBtn = document.getElementById("addEventBtn");
const addEventBtnTop = document.getElementById("addEventBtnTop");

const closeModalBtn = document.getElementById("closeModal");

const eventTitleInput = document.getElementById("eventTitle");
const eventDayHidden = document.getElementById("eventDay");
const selectedDayText = document.getElementById("selectedDay");

const eventTimeInput = document.getElementById("eventTime");

const saveEventBtn = document.getElementById("saveEventBtn");
const deleteEventBtn = document.getElementById("deleteEvent");

const eventList = document.getElementById("eventList");

let selectedColor = "#8f7cff";
let events = JSON.parse(localStorage.getItem("savedEvents")) || [];

// ==============================
// RENDER EVENTS IN LEFT PANEL
// ==============================
function renderEvents() {
  eventList.innerHTML = "";

  events.forEach((event, index) => {
    const div = document.createElement("div");
    div.className = "event-item";
    div.style.borderLeft = `5px solid ${event.color}`;

    div.innerHTML = `
      <div class="event-item-title">${event.title}</div>
      <div class="event-item-info">${event.day} • ${event.time}</div>
      <button class="event-delete-btn" data-index="${index}">✕</button>
    `;

    eventList.appendChild(div);
  });

  // Delete button inside list
  document.querySelectorAll(".event-delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      events.splice(index, 1);
      localStorage.setItem("savedEvents", JSON.stringify(events));
      renderEvents();
    });
  });
}

// ==============================
// OPEN EVENT MODAL
// ==============================
function openEventModal() {
  eventModal.style.display = "flex";
}

// ==============================
// CLOSE EVENT MODAL
// ==============================
function closeEventModal() {
  eventModal.style.display = "none";
  eventTitleInput.value = "";
  eventTimeInput.value = "";
}

// ==============================
// BUTTONS OPEN MODAL
// ==============================
addEventBtn.addEventListener("click", openEventModal);
addEventBtnTop.addEventListener("click", openEventModal);

// ==============================
// CLOSE MODAL BUTTON
// ==============================
closeModalBtn.addEventListener("click", closeEventModal);

// ==============================
// COLOR PICKER
// ==============================
document.querySelectorAll("#eventColors .color-dot").forEach(dot => {
  dot.addEventListener("click", () => {
    document.querySelectorAll("#eventColors .color-dot").forEach(d => d.classList.remove("active"));
    dot.classList.add("active");
    selectedColor = dot.dataset.color;
  });
});

// ==============================
// DROPDOWN DAY SELECT
// ==============================
document.querySelectorAll("#dayOptions .dropdown-option").forEach(option => {
  option.addEventListener("click", () => {
    const value = option.dataset.value;
    eventDayHidden.value = value;
    selectedDayText.textContent = option.textContent;
  });
});

// ==============================
// SAVE EVENT BUTTON
// ==============================
saveEventBtn.addEventListener("click", () => {
  const title = eventTitleInput.value.trim();
  const day = selectedDayText.textContent.trim();
  const time = eventTimeInput.value;

  if (title === "" || time === "") {
    alert("Please enter Event Title and Time!");
    return;
  }

  const newEvent = {
    title,
    day,
    time,
    color: selectedColor
  };

  events.push(newEvent);

  localStorage.setItem("savedEvents", JSON.stringify(events));

  renderEvents();
  closeEventModal();
});

// ==============================
// DELETE EVENT BUTTON INSIDE MODAL
// ==============================
deleteEventBtn.addEventListener("click", () => {
  eventTitleInput.value = "";
  eventTimeInput.value = "";
});

// ==============================
// LOAD EVENTS ON START
// ==============================
renderEvents();
const homeBtn = document.getElementById("homeBtn");

homeBtn.addEventListener("click", () => {
  window.location.href = "index.html"; // change to your homepage file name
});
