const express = require("express");
const path = require("path");
const fs = require("fs");

const db = require("./db/db.json");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));



app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);



app.get("/api/notes", (req, res) => {
  console.info(`${req.method} request received for notes`);

  res.json(db);
});

app.get("/api/notes:id", (req, res) => {
  if (req.params.id) {
    console.info(`${req.method} request received to get a single note`);
    const noteId = req.params.id;
    for (let i = 0; i < db.length; i++) {
      const currentNote = db[i];
      if (currentNote.id === noteId) {
        res.json(currentNote);
        return;
      }
    }
    res.status(404).send("Note not found");
  } else {
    res.status(400).send("Note ID not provided");
  }
});

app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  let currentId = db.length;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: currentId + 1,
    };

    fs.readFile("./db/db.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
      } else {
        db.push(newNote);

        fs.writeFileSync(
          "./db/db.json",
          JSON.stringify(db, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes!")
        );
      }
    });

    const response = {
      status: "success",
      body: newNote,
    };

    res.json(db);

    res.status(201).json(response);
  } else {
    res.status(500).json("Error in posting note");
  }
});

app.delete("api/notes/:id", (req, res) => {
  if (req.params.id) {
    console.info(`${req.method} request received`);
    const noteId = req.params.id;
    for (let i = 0; i < db.length; i++) {

      const currentNote = db[i];

      if (currentNote.id === noteId) {
        console.log("found match");
        res.send(currentNote);
        db.splice(i, 1);
        console.log(db);
        fs.writeFileSync(
          "./db/db.json",
          JSON.stringify(db, null, 4),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info("Successfully updated notes!")
        );
      }
    }
    res.status(404).send("Note not found");
  } else {
    res.status(400).send("Note ID not provided");
  }
});

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);
