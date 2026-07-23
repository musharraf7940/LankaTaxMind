import React from "react";
import { Plus, MessageSquare, Trash2, Menu } from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen, logo, chatList, currentChatId, startNewChat, loadChat, deleteChat }) {
  return (
    <>
      <div className="top-bar">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={18} />
        </button>
        <img src={logo} alt="LankaTaxMind" className="top-bar-logo" />
      </div>

      {sidebarOpen && (
        <div className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-label">Chats</span>
          </div>
          <button className="new-chat-btn" onClick={startNewChat}>
            <Plus size={16} />
            <span>New chat</span>
          </button>
          <div className="chat-history-list">
            {chatList.map((chat) => (
              <div
                key={chat.id}
                className={`chat-history-item ${chat.id === currentChatId ? "active" : ""}`}
                onClick={() => loadChat(chat)}
              >
                <MessageSquare size={14} />
                <span className="chat-history-title">{chat.title}</span>
                <button className="delete-chat-btn" onClick={(e) => deleteChat(e, chat.id)} title="Delete chat">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;