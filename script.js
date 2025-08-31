
const notesContainer = document.querySelector(".note-container");
const trashContainer = document.querySelector(".trash-container");
const btn = document.querySelector(".btn");
const trashBtn = document.querySelector(".trash-btn"); 

function updateStorage() {
    localStorage.setItem("notes", notesContainer.innerHTML);
    localStorage.setItem("trash", trashContainer.innerHTML);
}

function attachNoteEvents(note) {
    let title = note.querySelector(".note-title");
    let body = note.querySelector(".note-body");
    let del = note.querySelector(".delete");
    let pin = note.querySelector(".pin");
    let colorBtn = note.querySelector(".color");
    let shareBtn = note.querySelector(".share");
    let downloadBtn = note.querySelector(".download");
    let lockBtn = note.querySelector(".lock");
    let timeEl = note.querySelector(".note-time");

    // delete → move to trash
    del.onclick = () => {
        note.remove();

        // convert to trash note
        note.classList.add("trash-note");
        note.classList.remove("note");

        // remove old buttons
        note.querySelectorAll(".delete,.pin,.color,.share,.download,.lock").forEach(btn => btn.remove());

        // add restore + permanent delete
        let trashActions = document.createElement("div");
        trashActions.className = "trash-actions";

        let restoreBtn = document.createElement("button");
        restoreBtn.className = "restore";
        restoreBtn.innerText = "Restore";

        let permDeleteBtn = document.createElement("button");
        permDeleteBtn.className = "permanent-delete";
        permDeleteBtn.innerText = "Delete Permanently";

        trashActions.appendChild(restoreBtn);
        trashActions.appendChild(permDeleteBtn);
        note.appendChild(trashActions);

        trashContainer.appendChild(note);
        attachTrashEvents(note);

        updateStorage();
    };

    // pin
    pin.onclick = () => {
        if (note.classList.contains("pinned")) {
            note.classList.remove("pinned");
            notesContainer.appendChild(note);
        } else {
            note.classList.add("pinned");
            notesContainer.prepend(note);
        }
        updateStorage();
    };

    // edit timestamp
    [title, body].forEach(el => {
        el.onkeyup = () => {
            timeEl.innerText = "Last Edited: " + new Date().toLocaleString();
            updateStorage();
        };
    });

    // color picker
    colorBtn.onclick = () => {
        let picker = document.createElement("input");
        picker.type = "color";
        picker.style.position = "absolute";
        picker.style.left = "-9999px";
        document.body.appendChild(picker);

        picker.click();

        picker.oninput = (e) => {
            note.style.backgroundColor = e.target.value;
            updateStorage();
        };

        picker.onblur = () => picker.remove();
    };

    // share
    shareBtn.onclick = () => {
        let text = `📝 ${title.innerText}\n\n${body.innerText}\n\n${timeEl.innerText}`;
        if (navigator.share) {
            navigator.share({
                title: title.innerText,
                text: text
            }).catch(err => console.log("Share failed", err));
        } else {
            alert("Sharing not supported in this browser.");
        }
    };

    // download
    downloadBtn.onclick = () => {
        let text = `Title: ${title.innerText}\n\n${body.innerText}\n\n${timeEl.innerText}`;
        let blob = new Blob([text], { type: "text/plain" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${title.innerText || "note"}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    // lock / unlock
    lockBtn.onclick = () => {
        if (!note.dataset.locked) {
            let pwd = prompt("Set a password for this note:");
            if (pwd) {
                note.dataset.locked = "true";
                note.dataset.password = pwd;
                body.style.display = "none";
                lockBtn.innerText = "Unlock";
                updateStorage();
            }
        } else {
            let pwd = prompt("Enter password to unlock:");
            if (pwd === note.dataset.password) {
                note.dataset.locked = "";
                body.style.display = "block";
                lockBtn.innerText = "Lock";
                updateStorage();
            } else {
                alert("Incorrect password!");
            }
        }
    };
}


function attachTrashEvents(note) {
    let restoreBtn = note.querySelector(".restore");
    let permDeleteBtn = note.querySelector(".permanent-delete");

    restoreBtn.onclick = () => {
        note.remove();

        // restore to normal note
        note.classList.add("note");
        note.classList.remove("trash-note");
        note.querySelector(".trash-actions").remove();

        // re-add normal actions
        addNoteButtons(note);

        notesContainer.appendChild(note);
        attachNoteEvents(note);
        updateStorage();
    };

    permDeleteBtn.onclick = () => {
        note.remove();
        updateStorage();
    };
}

function addNoteButtons(note) {
    // delete
    let del = document.createElement("img");
    del.src = "images/delete.png";
    del.className = "delete";

    // pin
    let pin = document.createElement("img");
    pin.src = "images/pin.jpg";
    pin.className = "pin";

    // color
    let colorBtn = document.createElement("img");
    colorBtn.src = "images/color.png";
    colorBtn.className = "color";

    // actions container
    let actions = document.createElement("div");
    actions.className = "note-actions";

    let shareBtn = document.createElement("button");
    shareBtn.innerText = "Share";
    shareBtn.className = "share";

    let downloadBtn = document.createElement("button");
    downloadBtn.innerText = "Download";
    downloadBtn.className = "download";

    let lockBtn = document.createElement("button");
    lockBtn.className = "lock";
    lockBtn.innerText = "Lock";

    actions.appendChild(shareBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(lockBtn);

    note.appendChild(del);
    note.appendChild(pin);
    note.appendChild(colorBtn);
    note.appendChild(actions);
}

function showNotes() {
    const savedNotes = localStorage.getItem("notes");
    const savedTrash = localStorage.getItem("trash");

    if (savedNotes) {
        notesContainer.innerHTML = savedNotes;
        document.querySelectorAll(".note").forEach(note => {
            attachNoteEvents(note);
        });
    }
    if (savedTrash) {
        trashContainer.innerHTML = savedTrash;
        document.querySelectorAll(".trash-note").forEach(note => {
            attachTrashEvents(note);
        });
    }
}
showNotes();

btn.addEventListener("click", () => {
    let note = document.createElement("div");
    note.className = "note";

    // Title
    let title = document.createElement("h3");
    title.className = "note-title";
    title.contentEditable = "true";
    title.innerText = "Untitled";

    // Body
    let body = document.createElement("p");
    body.className = "note-body";
    body.contentEditable = "true";
    body.innerText = "Write something...";

    // Timestamp
    let time = document.createElement("span");
    time.className = "note-time";
    time.innerText = "Last Edited: " + new Date().toLocaleString();

    note.appendChild(title);
    note.appendChild(body);
    note.appendChild(time);

    addNoteButtons(note);

    notesContainer.appendChild(note);
    attachNoteEvents(note);
    updateStorage();
});

document.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.contentEditable === "true") {
        document.execCommand("insertLineBreak");
        event.preventDefault();
    }
});


const searchInput = document.getElementById("search");
searchInput.addEventListener("keyup", (e) => {
    let term = e.target.value.toLowerCase();
    let notes = document.querySelectorAll(".note");

    notes.forEach(note => {
        let title = note.querySelector(".note-title").innerText.toLowerCase();
        let body = note.querySelector(".note-body").innerText.toLowerCase();

        note.style.display = (title.includes(term) || body.includes(term)) 
            ? "block" 
            : "none";
    });
});

trashBtn.addEventListener("click", () => {
    if (notesContainer.style.display !== "none") {
        // Switch to trash view
        notesContainer.style.display = "none";
        trashContainer.style.display = "block";
        trashBtn.innerHTML = "<img src='images/edit.png'> Back to Notes";
    } else {
        // Switch back to notes view
        notesContainer.style.display = "block";
        trashContainer.style.display = "none";
        trashBtn.innerHTML = "<img src='images/trash.png'> Trash";
    }
});
