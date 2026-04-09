const express = require("express");
const fs = require("fs");

const app = express();
const PORT = 3000;
const CHAT_FILE = "chats.json";

app.use(express.json());
app.use(express.static("public"));

// Save chat
app.post("/save-chat", (req, res) => {
    const chat = req.body;

    let chats = [];
    if (fs.existsSync(CHAT_FILE)) {
        chats = JSON.parse(fs.readFileSync(CHAT_FILE));
    }

    chats.push(chat);

    fs.writeFileSync(CHAT_FILE, JSON.stringify(chats, null, 2));

    res.json({ success: true });
});

// Get saved chats
app.get("/get-chats", (req, res) => {
    if (fs.existsSync(CHAT_FILE)) {
        const chats = JSON.parse(fs.readFileSync(CHAT_FILE));
        res.json(chats);
    } else {
        res.json([]);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});