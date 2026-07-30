# Sentiment-Based Reply System

## Overview

The Sentiment-Based Reply System is a web application that analyzes the sentiment of user messages and generates appropriate responses. It also stores conversations so users can review previous chats.

The project is built using Node.js and Express, with chat history stored locally in JSON format.

---

## Features

- Analyze user sentiment
- Generate emotion-based replies
- Save chat history automatically
- View previous conversations
- REST API for storing and retrieving chats
- Lightweight and easy to set up

---

## Technologies Used

- Node.js
- Express.js
- JavaScript
- HTML
- CSS
- JSON

---

## Project Structure

```
Sentiment-Based-Reply-System/
│
├── public/               # Frontend files
├── server.js             # Express server
├── chats.json            # Stored chat history
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Installation

1. Clone the repository

```bash
git clone https://github.com/your-username/Sentiment-Based-Reply-System.git
```

2. Navigate to the project folder

```bash
cd Sentiment-Based-Reply-System
```

3. Install dependencies

```bash
npm install
```

4. Start the server

```bash
npm start
```

5. Open your browser

```
http://localhost:3000
```

---

## API Endpoints

### Save Chat

**POST**

```
/save-chat
```

Stores a chat conversation in `chats.json`.

---

### Get Chat History

**GET**

```
/get-chats
```

Returns all previously saved conversations.

---

## Sample Chat Record

```json
{
  "userText": "I'm doing well",
  "botReply": "I love the upbeat tone here! 🌻",
  "sentiment": "positive",
  "score": 0.2,
  "time": "4/9/2026, 8:40:07 PM"
}
```

---

## Future Enhancements

- User authentication
- Database integration (MongoDB/MySQL)
- AI-powered sentiment analysis
- Real-time chat support
- Dashboard with analytics
- Export chat history

---

## Author

**Aishwarya BS**

## License

This project is developed for educational and learning purposes.
