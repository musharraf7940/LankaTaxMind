import React from "react";
import ReactMarkdown from "react-markdown";
import { AlertCircle, Copy, Check, Pencil } from "lucide-react";
import SourceItem from "./SourceItem";

function ChatMessage({
  msg, idx, editingIndex, editText, setEditText, startEdit, saveEdit, cancelEdit,
  copiedIndex, copyToClipboard, explanations, explainingKey, explainSource, messages
}) {
  return (
    <div className={`message ${msg.role}`}>
      <div className="message-bubble">
        {editingIndex === idx ? (
          <div className="edit-area">
            <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} autoFocus />
            <div className="edit-actions">
              <button className="edit-save" onClick={() => saveEdit(idx)}>Save &amp; Resend</button>
              <button className="edit-cancel" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="message-text">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>

            {msg.warning && (
              <div className="warning-badge">
                <AlertCircle size={14} />
                <span>{msg.warning}</span>
              </div>
            )}

            {msg.sources && msg.sources.length > 0 && (
              <div className="sources">
                <p className="sources-title">Sources</p>
                {msg.sources.map((src, i) => {
                  const key = `${idx}-${i}`;
                  return (
                    <SourceItem
                      key={i}
                      src={src}
                      idx={idx}
                      i={i}
                      explanation={explanations[key]}
                      isLoading={explainingKey === key}
                      onExplain={() => explainSource(idx, i, messages[idx - 1]?.content || "", src.text || "")}
                    />
                  );
                })}
              </div>
            )}

            <div className="message-actions">
              <button className="action-btn" onClick={() => copyToClipboard(msg.content, idx)} title="Copy">
                {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
              </button>
              {msg.role === "user" && (
                <button className="action-btn" onClick={() => startEdit(idx, msg.content)} title="Edit">
                  <Pencil size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;