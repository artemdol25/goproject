document.addEventListener("DOMContentLoaded", () => {
    loadNotes();
    loadStats();
});

function loadNotes() {
    fetch("http://localhost:8000/notes")
        .then(response => response.json())
        .then(data => {
            displayNotes(data.notes);
            displayStats(data.stats);
        })
        .catch(error => console.error("Ошибка при загрузке заметок:", error));
}

function loadStats() {
    fetch("http://localhost:8001/stats")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(stats => displayStats(stats))
        .catch(error => console.error("Ошибка при загрузке статистики:", error));
}

function displayNotes(notes) {
    const notesContainer = document.getElementById("notes-container");
    notesContainer.innerHTML = "";
    notes.forEach(note => {
        const noteDiv = document.createElement("div");
        noteDiv.innerText = note.text;
        notesContainer.appendChild(noteDiv);
    });
}

function displayStats(stats) {
    const statsContainer = document.getElementById("stats-container");
    statsContainer.innerHTML = "";
    const statsDiv = document.createElement("div");
    statsDiv.innerText = `Количество созданных заметок: ${stats.created_notes}`;
    statsContainer.appendChild(statsDiv);
}

function openNoteForm() {
    const noteForm = document.getElementById("note-form");
    const addNoteBtn = document.getElementById("add-note-btn");
    if (noteForm.style.display === "none" || noteForm.style.display === "") {
        noteForm.style.display = "block";
        addNoteBtn.innerText = "Закрыть форму";
        addNoteBtn.style.backgroundColor = "#e91a1a";
    } else {
        noteForm.style.display = "none";
        addNoteBtn.innerText = "Добавить заметку";
        addNoteBtn.style.backgroundColor = "#4CAF50";
    }
}

function closeNoteForm() {
    document.getElementById("note-form").style.display = "none";
    document.getElementById("add-note-btn").innerText = "Добавить заметку";
    document.getElementById("add-note-btn").style.backgroundColor = "#4CAF50";
}

function saveNote() {
    const noteText = document.getElementById("note-text").value;
    if (!noteText.trim()) {
        alert("Пожалуйста, введите текст заметки.");
        return;
    }
    fetch("http://localhost:8000/notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: noteText }),
    })
    .then(response => response.json())
    .then(savedNote => {
        const notesContainer = document.getElementById("notes-container");
        const noteDiv = document.createElement("div");
        noteDiv.innerText = savedNote.text;
        notesContainer.appendChild(noteDiv);
        document.getElementById("note-text").value = "";
        closeNoteForm();        
        loadStats();
    })
    .catch(error => console.error("Ошибка при сохранении заметки:", error));
}