const notesList = document.getElementById("notesList");
const addNoteBtn = document.getElementById("addNoteBtn");
const totalNotes = document.getElementById("totalNotes");
const searchNotes = document.getElementById("searchNotes");

const noteTitle = document.getElementById("noteTitle");
const noteContent = document.getElementById("noteContent");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const homeBtn = document.getElementById("homeBtn");

let notes = [];
let selectedNoteId = null;

// Home button
homeBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// Add note
addNoteBtn.addEventListener("click", () => {
  selectedNoteId = null;
  noteTitle.value = "";
  noteContent.value = "";
});

// Save note
saveNoteBtn.addEventListener("click", () => {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  if (!title) return alert("Title is required");

  if (selectedNoteId === null) {
    const newNote = {
      id: Date.now(),
      title,
      content
    };
    notes.push(newNote);
  } else {
    const note = notes.find(n => n.id === selectedNoteId);
    note.title = title;
    note.content = content;
  }
  renderNotes();
});

// Delete note
deleteNoteBtn.addEventListener("click", () => {
  if (selectedNoteId === null) return;
  notes = notes.filter(n => n.id !== selectedNoteId);
  selectedNoteId = null;
  noteTitle.value = "";
  noteContent.value = "";
  renderNotes();
});

// Render notes
function renderNotes() {
  notesList.innerHTML = "";
  const search = searchNotes.value.toLowerCase();
  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search));

  filteredNotes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `<h4>${note.title}</h4>`;
    card.addEventListener("click", () => {
      selectedNoteId = note.id;
      noteTitle.value = note.title;
      noteContent.value = note.content;
    });
    notesList.appendChild(card);
  });
  totalNotes.textContent = notes.length;
}

// Live search
searchNotes.addEventListener("input", renderNotes);
