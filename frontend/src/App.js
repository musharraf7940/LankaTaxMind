import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import LogoSpinner from "./LogoSpinner";
import Login from "./Login";
import logo from "./assets/logo.jpeg";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatMessage from "./components/ChatMessage";
import MessageInput from "./components/MessageInput";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/ask`;

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I'm LankaTaxMind — your AI assistant for Sri Lankan tax law. Ask me anything about tax legislation, case precedents, or statutory interpretation.",
      sources: [],
      warning: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [explainingKey, setExplainingKey] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [chatList, setChatList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setChatList(chats);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || messages.length <= 1) return;

    const saveChat = async () => {
      const title = messages.find((m) => m.role === "user")?.content?.slice(0, 50) || "New chat";

      if (currentChatId) {
        await updateDoc(doc(db, "chats", currentChatId), {
          messages,
          title,
          updatedAt: serverTimestamp(),
        });
      } else {
        const newDoc = await addDoc(collection(db, "chats"), {
          userId: user.uid,
          title,
          messages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentChatId(newDoc.id);
      }
    };

    const debounce = setTimeout(saveChat, 800);
    return () => clearTimeout(debounce);
  }, [messages, user, currentChatId]);

  const askBackend = async (question, historyUpToIndex) => {
    setLoading(true);

    const conversationHistory = historyUpToIndex
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const stages = [
      { text: "Understanding your question...", delay: 0 },
      { text: "Searching audit and tax knowledge base...", delay: 1500 },
      { text: "Cross-referencing case law and statutes...", delay: 3500 },
      { text: "Verifying citations against source documents...", delay: 6000 },
      { text: "Preparing your grounded response...", delay: 9000 },
    ];

    setLoadingStage(stages[0].text);
    const timers = stages.slice(1).map((stage) =>
      setTimeout(() => setLoadingStage(stage.text), stage.delay)
    );

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        API_URL,
        { question, history: conversationHistory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
     const { answer, sources, warning, draft_offered } = response.data;

setMessages([
  ...historyUpToIndex,
  {
    role: "assistant",
    content: answer,
    sources: sources || [],
    warning: warning || "",
    draftOffered: draft_offered || false,
  },
]);
    } catch (error) {
      setMessages([
        ...historyUpToIndex,
        {
          role: "assistant",
          content:
            "Something went wrong connecting to LankaTaxMind. Please make sure the backend server is running and try again.",
          sources: [],
          warning: "Connection error",
        },
      ]);
    } finally {
      timers.forEach((t) => clearTimeout(t));
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const askAboutDocument = async (question, file, historyUpToIndex) => {
    setLoading(true);
    setLoadingStage("Reading your document...");

    try {
      const token = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      setTimeout(() => setLoadingStage("Cross-referencing against tax law..."), 2000);
      setTimeout(() => setLoadingStage("Preparing your analysis..."), 5000);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/ask-document?question=${encodeURIComponent(question)}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { answer, sources, warning } = response.data;

      setMessages([
        ...historyUpToIndex,
        {
          role: "assistant",
          content: answer,
          sources: sources || [],
          warning: warning || "",
        },
      ]);
    } catch (error) {
      setMessages([
        ...historyUpToIndex,
        {
          role: "assistant",
          content:
            "Could not process that document. Please make sure it's a PDF, Word, or Excel file and try again.",
          sources: [],
          warning: "Document processing error",
        },
      ]);
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const generateDocument = async (documentType, facts) => {
    setLoading(true);
    setLoadingStage("Drafting your document...");

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/draft`,
        { document_type: documentType, facts },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${documentType.replace(/\s+/g, "_")}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Your ${documentType} has been generated and downloaded. Please review it carefully before submission — placeholder fields marked in [BRACKETS] need to be filled in with the correct details.`,
          sources: [],
          warning: "AI-generated draft — review required before use.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Could not generate the document right now. Please try again shortly.",
          sources: [],
          warning: "Document generation error",
        },
      ]);
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || loading) return;

   const draftConfirmations = ["yes", "yes please", "sure", "go ahead", "draft it", "please draft it", "yes draft it", "ok draft it"];
const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
const offeredDraft = lastAssistantMsg?.draftOffered === true;
const userConfirming = draftConfirmations.includes(input.trim().toLowerCase());

    if (offeredDraft && userConfirming && !attachedFile) {
      const userMessage = { role: "user", content: input };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");

      const conversationSummary = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => `${m.role === "user" ? "User" : "LankaTaxMind"}: ${m.content}`)
        .join("\n\n");

      const typeMatch = lastAssistantMsg.content.match(/draft (?:a |an |the )?(?:formal )?([a-zA-Z\s]+?)(?:\s+based on this)?\?/i);
      const documentType = typeMatch ? typeMatch[1].trim() : "Legal Document";

      await generateDocument(documentType, conversationSummary);
      return;
    }

    const questionText = input.trim() || "Summarize this document and identify any tax implications.";
    const userMessage = attachedFile
      ? { role: "user", content: `${questionText}\n\n📎 ${attachedFile.name}` }
      : { role: "user", content: input };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    if (attachedFile) {
      const fileToSend = attachedFile;
      removeAttachedFile();
      askAboutDocument(questionText, fileToSend, newMessages);
    } else {
      askBackend(input, newMessages);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startEdit = (idx, currentText) => {
    setEditingIndex(idx);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  const saveEdit = (idx) => {
    if (!editText.trim()) return;
    const truncated = messages.slice(0, idx);
    const editedMessage = { role: "user", content: editText };
    const newMessages = [...truncated, editedMessage];
    setMessages(newMessages);
    setEditingIndex(null);
    setEditText("");
    askBackend(editText, newMessages);
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([
      {
        role: "assistant",
        content:
          "Hello, I'm LankaTaxMind — your AI assistant for Sri Lankan tax law. Ask me anything about tax legislation, case precedents, or statutory interpretation.",
        sources: [],
        warning: "",
      },
    ]);
  };

  const loadChat = (chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "chats", chatId));
    if (currentChatId === chatId) startNewChat();
  };

  const explainSource = async (msgIdx, srcIdx, question, chunkText) => {
    const key = `${msgIdx}-${srcIdx}`;

    if (explanations[key]) {
      setExplanations((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      return;
    }

    setExplainingKey(key);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/explain`,
        { question, chunk_text: chunkText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExplanations((prev) => ({ ...prev, [key]: response.data }));
    } catch (error) {
      setExplanations((prev) => ({
        ...prev,
        [key]: { error: "Could not generate explanation right now." },
      }));
    } finally {
      setExplainingKey(null);
    }
  };

  if (!authChecked) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

 return (
    <div className="app-layout">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logo={logo}
        chatList={chatList}
        currentChatId={currentChatId}
        startNewChat={startNewChat}
        loadChat={loadChat}
        deleteChat={deleteChat}
      />

      <div className="app">
        <header className="header">
          <div className="header-content" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src={logo} alt="LankaTaxMind logo" style={{ height: "36px" }} />
            <div>
              <h1>LankaTaxMind</h1>
              <p>Domain-specific AI for Sri Lankan Tax Law Consulting</p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => signOut(auth)} title="Sign out">
            <LogOut size={16} />
          </button>
        </header>

        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                msg={msg}
                idx={idx}
                messages={messages}
                editingIndex={editingIndex}
                editText={editText}
                setEditText={setEditText}
                startEdit={startEdit}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                copiedIndex={copiedIndex}
                copyToClipboard={copyToClipboard}
                explanations={explanations}
                explainingKey={explainingKey}
                explainSource={explainSource}
              />
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-bubble loading-bubble">
                  <LogoSpinner size={34} />
                  <span>{loadingStage}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            input={input}
            setInput={setInput}
            handleKeyPress={handleKeyPress}
            handleSend={handleSend}
            loading={loading}
            attachedFile={attachedFile}
            removeAttachedFile={removeAttachedFile}
            fileInputRef={fileInputRef}
            handleFileSelect={handleFileSelect}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

