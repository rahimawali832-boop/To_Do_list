document.addEventListener('DOMContentLoaded', () => {

  const meetingsList = document.getElementById('meetingsList');
  const totalMeetings = document.getElementById('totalMeetings');

  const addMeetingBtn = document.getElementById('addMeetingBtn');
  const meetingModal = document.getElementById('meetingModal');
  const closeMeetingModal = document.getElementById('closeMeetingModal');

  const saveMeetingBtn = document.getElementById('saveMeetingBtn');
  const deleteMeetingBtn = document.getElementById('deleteMeetingBtn');

  const meetingTitleInput = document.getElementById('meetingTitle');
  const meetingDateTimeInput = document.getElementById('meetingDateTime');
  const meetingParticipantsInput = document.getElementById('meetingParticipants');
  const meetingPlatformSelect = document.getElementById('meetingPlatform');
  const meetingLinkInput = document.getElementById('meetingLink');
  const meetingColorInput = document.getElementById('meetingColor');

  const liveClock = document.getElementById('liveClock');
  const nextMeetingTitle = document.getElementById('nextMeetingTitle');
  const nextMeetingCountdown = document.getElementById('nextMeetingCountdown');
  const nextMeetingLinks = document.getElementById('nextMeetingLinks');

  let meetings = JSON.parse(localStorage.getItem('myMeetings')) || [];
  let editingId = null;

  // Open Modal
  addMeetingBtn.addEventListener('click', () => {
    openModal();
  });

  closeMeetingModal.addEventListener('click', () => {
    closeModal();
  });

  function openModal(meeting = null) {
    meetingModal.style.display = 'flex';
    if(meeting) {
      editingId = meeting.id;
      meetingTitleInput.value = meeting.title;
      meetingDateTimeInput.value = meeting.dateTime;
      meetingParticipantsInput.value = meeting.participants;
      meetingPlatformSelect.value = meeting.platform;
      meetingLinkInput.value = meeting.link;
      meetingColorInput.value = meeting.color;
      document.getElementById('modalTitle').textContent = 'Edit Meeting';
    } else {
      editingId = null;
      meetingTitleInput.value = '';
      meetingDateTimeInput.value = '';
      meetingParticipantsInput.value = '';
      meetingPlatformSelect.value = 'google';
      meetingLinkInput.value = '';
      meetingColorInput.value = '#8f7cff';
      document.getElementById('modalTitle').textContent = 'Add Meeting';
    }
  }

  function closeModal() {
    meetingModal.style.display = 'none';
  }

  // Save Meeting
  saveMeetingBtn.addEventListener('click', () => {
    const title = meetingTitleInput.value.trim();
    const dateTime = meetingDateTimeInput.value;
    const participants = meetingParticipantsInput.value.trim();
    const platform = meetingPlatformSelect.value;
    const link = meetingLinkInput.value.trim();
    const color = meetingColorInput.value;

    if(!title || !dateTime){
      alert('Title and Date/Time are required!');
      return;
    }

    const meetingObj = {
      id: editingId || Date.now(),
      title, dateTime, participants, platform, link, color
    };

    if(editingId){
      const idx = meetings.findIndex(m => m.id === editingId);
      meetings[idx] = meetingObj;
    } else {
      meetings.push(meetingObj);
    }

    localStorage.setItem('myMeetings', JSON.stringify(meetings));
    renderMeetings();
    updateNextMeeting();
    closeModal();
  });

  // Delete Meeting
  deleteMeetingBtn.addEventListener('click', () => {
    if(editingId){
      meetings = meetings.filter(m => m.id !== editingId);
      localStorage.setItem('myMeetings', JSON.stringify(meetings));
      renderMeetings();
      updateNextMeeting();
      closeModal();
    }
  });

  // Render Meetings in Left Panel
  function renderMeetings() {
    meetingsList.innerHTML = '';
    meetings.forEach(m => {
      const card = document.createElement('div');
      card.className = 'meeting-card';
      card.style.borderLeftColor = m.color;
      card.innerHTML = `
        <h4>${m.title}</h4>
        <p>${new Date(m.dateTime).toLocaleString()}</p>
        <p>${m.participants}</p>
        <div class="meeting-actions">
          <button class="btn-edit">Edit</button>
        </div>
      `;
      card.querySelector('.btn-edit').addEventListener('click', () => {
        openModal(m);
      });
      meetingsList.appendChild(card);
    });
    totalMeetings.textContent = meetings.length;
  }

  // Live Clock
  function updateClock() {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString();
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Update Next Meeting Info
  function updateNextMeeting() {
    if(meetings.length === 0){
      nextMeetingTitle.textContent = 'No upcoming meeting';
      nextMeetingCountdown.textContent = '--:--:--';
      nextMeetingLinks.innerHTML = '';
      return;
    }

    const now = new Date();
    const upcoming = meetings.filter(m => new Date(m.dateTime) > now)
                             .sort((a,b) => new Date(a.dateTime)-new Date(b.dateTime));

    if(upcoming.length === 0){
      nextMeetingTitle.textContent = 'No upcoming meeting';
      nextMeetingCountdown.textContent = '--:--:--';
      nextMeetingLinks.innerHTML = '';
      return;
    }

    const next = upcoming[0];
    nextMeetingTitle.textContent = `${next.title} (${next.participants})`;

    function updateCountdown() {
      const diff = new Date(next.dateTime) - new Date();
      if(diff <= 0){
        nextMeetingCountdown.textContent = '00:00:00';
        return;
      }
      const h = String(Math.floor(diff/3600000)).padStart(2,'0');
      const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
      const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
      nextMeetingCountdown.textContent = `${h}:${m}:${s}`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Meeting links
    nextMeetingLinks.innerHTML = '';
    if(next.platform === 'google'){
      nextMeetingLinks.innerHTML = `<a href="${next.link}" target="_blank" class="google">Google Meet</a>`;
    } else if(next.platform === 'zoom'){
      nextMeetingLinks.innerHTML = `<a href="${next.link}" target="_blank" class="zoom">Zoom</a>`;
    } else {
      nextMeetingLinks.innerHTML = `<a href="${next.link}" target="_blank" class="other">Join</a>`;
    }
  }

  renderMeetings();
  updateNextMeeting();

  // Close modal clicking outside
  window.addEventListener('click', e => {
    if(e.target === meetingModal) closeModal();
  });

});
// ===== CLOCK =====
const analogClock = document.getElementById('analogClock');
const ctx = analogClock.getContext('2d');
const radius = analogClock.width / 2;

function drawClock() {
  ctx.clearRect(0,0,analogClock.width,analogClock.height);
  ctx.translate(radius, radius);

  // Draw face
  ctx.beginPath();
  ctx.arc(0,0,radius - 5,0,2*Math.PI);
  ctx.fillStyle = 'var(--panel)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'var(--accent)';
  ctx.stroke();

  // Draw numbers
  ctx.fillStyle = 'var(--text)';
  ctx.font = radius*0.15 + "px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for(let num=1; num<=12; num++){
    let ang = num * Math.PI/6;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.8);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0,0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.8);
    ctx.rotate(-ang);
  }

  // Get time
  const now = new Date();
  const hour = now.getHours()%12;
  const minute = now.getMinutes();
  const second = now.getSeconds();

  // Hour hand
  drawHand((hour + minute/60)*30*Math.PI/180, radius*0.5, 6);
  // Minute hand
  drawHand((minute + second/60)*6*Math.PI/180, radius*0.75, 4);
  // Second hand
  drawHand(second*6*Math.PI/180, radius*0.85, 2, 'var(--danger)');

  ctx.translate(-radius, -radius);
}

function drawHand(pos, length, width, color = 'var(--accent)') {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.moveTo(0,0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

// Digital clock
function updateDigitalClock(){
  const now = new Date();
  const hours = String(now.getHours()).padStart(2,'0');
  const mins = String(now.getMinutes()).padStart(2,'0');
  const secs = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('digitalClock').textContent = `${hours}:${mins}:${secs}`;
}

// Update every second
setInterval(() => {
  drawClock();
  updateDigitalClock();
}, 1000);

// ===== DYNAMIC MEETINGS =====
const upcomingMeetings = [
  {title:'Project Sync', time:'10:00 AM', links:{google:'#',zoom:'#'}},
  {title:'Team Meeting', time:'2:30 PM', links:{google:'#',zoom:'#'}},
  {title:'Client Call', time:'5:00 PM', links:{google:'#',zoom:'#'}}
];

const meetingContainer = document.getElementById('upcomingMeetings');
upcomingMeetings.forEach(m=>{
  const card = document.createElement('div');
  card.className = 'meeting-card';
  card.innerHTML = `
    <h4>${m.title}</h4>
    <p>${m.time}</p>
    <div class="meeting-links">
      ${m.links.google ? `<a href="${m.links.google}" target="_blank" class="google">Google Meet</a>` : ''}
      ${m.links.zoom ? `<a href="${m.links.zoom}" target="_blank" class="zoom">Zoom</a>` : ''}
    </div>
  `;
  meetingContainer.appendChild(card);
});
const homeBtn = document.getElementById("homeBtn");

if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    window.location.href = "index.html"; // make sure index.html exists
  });
}
