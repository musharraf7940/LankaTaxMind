import React from "react";
import { Send, FileText, Paperclip } from "lucide-react";

function MessageInput({
  input, setInput, handleKeyPress, handleSend, loading,
  attachedFile, removeAttachedFile, fileInputRef, handleFileSelect
}) {
  return (
    <div className="input-wrapper">
      {attachedFile && (
        <div className="file-chip">
          <FileText size={13} />
          <span>{attachedFile.name}</span>
          <button onClick={removeAttachedFile} title="Remove">×</button>
        </div>
      )}
      <div className="input-area">
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.docx,.xlsx"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <button className="attach-btn" onClick={() => fileInputRef.current.click()} title="Attach document" disabled={loading}>
          <Paperclip size={18} />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            attachedFile
              ? "Ask something about this document, or leave blank for a summary..."
              : "Ask about Sri Lankan tax law, legislation, or case precedents..."
          }
          rows={1}
        />
        <button onClick={handleSend} disabled={loading || (!input.trim() && !attachedFile)}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;