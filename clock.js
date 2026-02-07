document.addEventListener("DOMContentLoaded",()=>{

  const addBtn = document.getElementById('addMeetingBtn');
  const modal = document.getElementById('meetingModal');
  const closeModal = document.getElementById('closeMeetingModal');
  const saveBtn = document.getElementById('saveMeetingBtn');
  const deleteBtn = document.getElementById('deleteMeetingBtn');

  const titleInput = document.getElementById('meetingTitle');
  const dateInput = document.getElementById('meetingDateTime');
  const platformInput = document.getElementById('meetingPlatform');
  const linkInput = document.getElementById('meetingLink');

  const list = document.getElementById('meetingList');

  let editingId = null;
  let meetings = JSON.parse(localStorage.getItem('meetings')) || [];

  function renderMeetings(){
    list.innerHTML = '';
    meetings.forEach(m=>{
      const div = document.createElement('div');
      div.className = 'meeting-card';
      div.innerHTML = `
        <strong>${m.title}</strong>
        <span>${new Date(m.date).toLocaleString()}</span>
        <span>${m.platform}</span>
        <a href="${m.link}" target="_blank">Join</a>
      `;
      div.addEventListener('click',()=>{
        editingId = m.id;
        titleInput.value = m.title;
        dateInput.value = m.date;
        platformInput.value = m.platform;
        linkInput.value = m.link;
        modal.style.display='flex';
      });
      list.appendChild(div);
    });
  }

  addBtn.addEventListener('click',()=>{
    editingId=null;
    titleInput.value='';
    dateInput.value='';
    platformInput.value='Zoom';
    linkInput.value='';
    modal.style.display='flex';
  });

  closeModal.addEventListener('click',()=>{ modal.style.display='none'; });

  saveBtn.addEventListener('click',()=>{
    const newMeeting = {
      id: editingId || Date.now(),
      title: titleInput.value,
      date: dateInput.value,
      platform: platformInput.value,
      link: linkInput.value
    };
    if(editingId){
      meetings = meetings.map(m=> m.id===editingId? newMeeting : m);
    } else meetings.push(newMeeting);

    localStorage.setItem('meetings', JSON.stringify(meetings));
    renderMeetings();
    modal.style.display='none';
  });

  deleteBtn.addEventListener('click',()=>{
    if(!editingId) return;
    meetings = meetings.filter(m=>m.id!==editingId);
    localStorage.setItem('meetings', JSON.stringify(meetings));
    renderMeetings();
    modal.style.display='none';
  });

  renderMeetings();

  // Live Clock
  const clock = document.getElementById('liveClock');
  setInterval(()=>{
    const d = new Date();
    clock.textContent = d.toLocaleTimeString();
  },1000);
});
