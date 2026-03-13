"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

/* -------- YOUTUBE PARSER -------- */

const getYouTubeId = (url) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

export default function Chat() {

/* -------- STATES -------- */

const [chats, setChats] = useState([{ id: 1, title: "New Chat", messages: [] }]);
const [activeChat, setActiveChat] = useState(1);
const [message, setMessage] = useState("");
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(false);
const [theme, setTheme] = useState("dark");
const [recording, setRecording] = useState(false);
const [speakingIndex, setSpeakingIndex] = useState(null);
const [stopStream, setStopStream] = useState(false);
const [dragActive, setDragActive] = useState(false);

const fileRef = useRef(null);
const chatEndRef = useRef(null);
const searchRef = useRef(null);

const currentChat = chats.find((c) => c.id === activeChat);

/* -------- ESCAPE REGEX -------- */

const escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/* -------- HIGHLIGHT SEARCH -------- */

const highlightText = (text) => {

  if (!search.trim()) return text;

  const safe = escapeRegex(search);
  const regex = new RegExp(`(${safe})`, "gi");

  return text.replace(regex, "**$1**");

};

/* -------- SEARCH FILTER (MESSAGES) -------- */

const filteredMessages =
  currentChat?.messages?.filter((msg) => {

    if (!search.trim()) return true;

    return msg.text
      ?.toLowerCase()
      .includes(search.trim().toLowerCase());

  }) || [];

/* -------- SEARCH FILTER (CHAT TITLES) -------- */

const filteredChats =
  chats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

/* -------- AUTO SCROLL TO SEARCH RESULT -------- */

useEffect(() => {

  if (search && filteredMessages.length > 0 && searchRef.current) {

    setTimeout(() => {
      searchRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }, 100);

  }

}, [search, filteredMessages]);

/* -------- LOAD STORAGE -------- */

useEffect(() => {

  const saved = localStorage.getItem("ai_chats");

  if (saved) {

    const parsed = JSON.parse(saved);
    setChats(parsed);

    if (parsed.length > 0)
      setActiveChat(parsed[0].id);

  }

}, []);

/* -------- SAVE STORAGE -------- */

useEffect(() => {
  localStorage.setItem("ai_chats", JSON.stringify(chats));
}, [chats]);

/* -------- AUTO SCROLL -------- */

useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [currentChat?.messages]);

/* -------- UPDATE CHAT -------- */

const updateMessages = (messages) => {

  setChats((prev) =>
    prev.map((chat) =>
      chat.id === activeChat ? { ...chat, messages } : chat
    )
  );

};

/* -------- NEW CHAT -------- */

const createNewChat = () => {

  const id = Date.now();

  const newChat = {
    id,
    title: "New Chat",
    messages: []
  };

  setChats([...chats, newChat]);
  setActiveChat(id);

};

/* -------- CLEAR CHAT -------- */

const clearChat = () => {

  if (!currentChat) return;
  updateMessages([]);

};

/* -------- DELETE CHAT -------- */

const deleteChat = (id) => {

  const filtered = chats.filter((c) => c.id !== id);

  setChats(filtered);

  if (filtered.length > 0)
    setActiveChat(filtered[0].id);

};

/* -------- RENAME CHAT -------- */

const renameChat = (id) => {

  const name = prompt("Enter chat name");

  if (!name) return;

  setChats((prev) =>
    prev.map((chat) =>
      chat.id === id ? { ...chat, title: name } : chat
    )
  );

};

/* -------- DOWNLOAD CHAT -------- */

const downloadChat = () => {

  if (!currentChat) return;

  const text = currentChat.messages
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n\n");

  const blob = new Blob([text], { type: "text/plain" });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "chat.txt";
  a.click();

};

/* -------- TEXT TO SPEECH -------- */

const speak = (text, index) => {

  if (window.speechSynthesis.speaking) {

    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    return;

  }

  const speech = new SpeechSynthesisUtterance(text);

  speech.lang = "en-US";

  speech.onend = () => setSpeakingIndex(null);

  setSpeakingIndex(index);

  window.speechSynthesis.speak(speech);

};

/* -------- VOICE INPUT -------- */

const startVoice = () => {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {

    alert("Voice not supported");
    return;

  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.start();

  setRecording(true);

  recognition.onresult = (event) => {

    setMessage(event.results[0][0].transcript);
    setRecording(false);

  };

  recognition.onerror = () => setRecording(false);

};

/* -------- STREAM RESPONSE -------- */

const streamResponse = async (text, oldMessages, images = [], videos = []) => {

  setStopStream(false);

  let current = "";
  const words = text.split(" ");

  for (let i = 0; i < words.length; i++) {

    if (stopStream) break;

    current += words[i] + " ";

    const aiMsg = {
      sender: "ai",
      text: current + "▋",
      images,
      videos,
      time: new Date().toLocaleTimeString()
    };

    updateMessages([...oldMessages, aiMsg]);

    await new Promise((r) => setTimeout(r, 20));

  }

  const finalMsg = {
    sender: "ai",
    text,
    images,
    videos,
    time: new Date().toLocaleTimeString()
  };

  updateMessages([...oldMessages, finalMsg]);

};

/* -------- SEND MESSAGE -------- */

const sendMessage = async () => {

  if (!message.trim() && !fileRef.current?.files?.[0]) return;

  const userMsg = {
    sender: "user",
    text: message,
    time: new Date().toLocaleTimeString()
  };

  const newMessages = [...currentChat.messages, userMsg];

  updateMessages(newMessages);

  setLoading(true);

  const formData = new FormData();
  formData.append("message", message);

  if (fileRef.current?.files?.[0])
    formData.append("file", fileRef.current.files[0]);

  setMessage("");

  try {

    const res = await fetch("http://127.0.0.1:8000/api/chat/", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    await streamResponse(
      data.reply || "No response",
      newMessages,
      data.images || [],
      data.videos || []
    );

  } catch {

    updateMessages([
      ...newMessages,
      {
        sender: "ai",
        text: "⚠️ Connection error. Check Django backend.",
        time: new Date().toLocaleTimeString()
      }
    ]);

  }

  setLoading(false);

};

/* -------- ENTER KEY SEND -------- */

const handleKeyDown = (e) => {

  if (e.key === "Enter" && !e.shiftKey) {

    e.preventDefault();
    sendMessage();

  }

};

/* -------- DRAG DROP -------- */

const handleDrop = (e) => {

  e.preventDefault();
  setDragActive(false);

  if (fileRef.current) {
    fileRef.current.files = e.dataTransfer.files;
  }

};

const btn =
"px-3 py-2 rounded-lg text-sm font-medium transition hover:scale-105";

/* -------- UI -------- */

return (

<div
onDragOver={(e) => {
  e.preventDefault();
  setDragActive(true);
}}
onDragLeave={() => setDragActive(false)}
onDrop={handleDrop}
className={`flex h-screen ${
theme === "dark"
? "bg-gray-900 text-white"
: "bg-gray-100 text-black"
}`}
>

{/* SIDEBAR */}

<div className="w-64 bg-black p-4 flex flex-col">

<h2 className="text-xl font-bold mb-4">
AI Assistant
</h2>

<button onClick={createNewChat} className={`${btn} bg-green-600 mb-2`}>
+ New Chat
</button>

<button onClick={clearChat} className={`${btn} bg-red-600 mb-2`}>
Clear Chat
</button>

<button onClick={downloadChat} className={`${btn} bg-blue-600 mb-2`}>
Download Chat
</button>

<div className="flex gap-1 mb-3">

<input
placeholder="Search chats or messages..."
value={search}
onChange={(e) => setSearch(e.target.value)}
className="flex-1 px-2 py-1 rounded text-black"
/>

<button
onClick={() => setSearch("")}
className="bg-gray-600 px-2 rounded"
>
✖
</button>

</div>

{search && (
<div className="text-xs mb-2 text-gray-400">
{filteredMessages.length} message result(s)
</div>
)}

<div className="flex-1 overflow-y-auto">

{filteredChats.map((chat) => (

<div
key={chat.id}
className={`p-2 mb-2 rounded flex justify-between ${
activeChat === chat.id
? "bg-gray-700"
: "hover:bg-gray-800"
}`}
>

<span onClick={() => setActiveChat(chat.id)}>
{chat.title}
</span>

<div className="flex gap-2">

<button onClick={() => renameChat(chat.id)}>
✏️
</button>

<button onClick={() => deleteChat(chat.id)}>
🗑
</button>

</div>

</div>

))}

</div>

<button
onClick={() =>
setTheme(theme === "dark" ? "light" : "dark")
}
className={`${btn} bg-gray-700 mt-3`}
>
Toggle Theme
</button>

</div>

{/* CHAT AREA */}

<div className="flex-1 flex flex-col">

<div className="flex-1 overflow-y-auto p-6 space-y-6">

{filteredMessages.map((msg, i) => (

<div
key={i}
ref={i === 0 ? searchRef : null}
className={`flex ${
msg.sender === "user"
? "justify-end"
: "justify-start"
}`}
>

<div
className={`max-w-xl px-4 py-3 rounded-xl break-words ${
msg.sender === "user"
? "bg-green-600"
: "bg-gray-800"
}`}
>

<ReactMarkdown>
{highlightText(msg.text)}
</ReactMarkdown>

<div className="text-xs opacity-70">
{msg.time}
</div>

{msg.sender === "ai" && (

<div className="flex gap-3 mt-2">

<button onClick={() => speak(msg.text, i)}>
{speakingIndex === i ? "⏹" : "🔊"}
</button>

<button onClick={() =>
navigator.clipboard.writeText(msg.text)
}>
📋
</button>

</div>

)}

{msg.images?.map((img, i) => (
<img
key={i}
src={img}
className="w-40 mt-3 rounded"
/>
))}

{msg.videos?.map((v, i) => {

const id = getYouTubeId(v);

return (
<iframe
key={i}
src={`https://www.youtube.com/embed/${id}`}
className="w-full aspect-video mt-3 rounded"
/>
);

})}

</div>

</div>

))}

{loading && <div>🤖 Thinking...</div>}

<div ref={chatEndRef} />

</div>

{/* INPUT */}

<div className="border-t border-gray-700 p-4 flex gap-2 bg-gray-800">

<input type="file" ref={fileRef} />

<textarea
value={message}
onChange={(e) => setMessage(e.target.value)}
onKeyDown={handleKeyDown}
className="flex-1 px-3 py-2 rounded text-black resize-none"
placeholder="Ask anything..."
/>

<button
onClick={startVoice}
className={`${btn} ${
recording ? "bg-red-500" : "bg-blue-500"
}`}
>
🎤
</button>

<button
onClick={() => setStopStream(true)}
className={`${btn} bg-red-500`}
>
Stop
</button>

<button
onClick={sendMessage}
className={`${btn} bg-green-600`}
>
Send
</button>

</div>

</div>

</div>

);
}