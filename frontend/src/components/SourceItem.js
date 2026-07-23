import React from "react";
import { FileText } from "lucide-react";

function SourceItem({ src, idx, i, explanation, isLoading, onExplain }) {
  return (
    <div className="source-block">
      <div className="source-item">
        <FileText size={13} />
        <span className="source-name">{src.source}</span>
        <span className="source-score">{(src.score * 100).toFixed(0)}% match</span>
        <button className="explain-btn" onClick={onExplain} disabled={isLoading}>
          {isLoading ? "Analyzing..." : explanation ? "Hide" : "Why this source?"}
        </button>
      </div>

      {explanation && !explanation.error && (
        <div className="explanation-box">
          <p className="explanation-intro">
            These are the key terms that made this source relevant to your question. Darker highlighting means a stronger contribution.
          </p>
          {explanation.words.map((word, w) => {
            const score = explanation.scores[w];
            const intensity = Math.min(Math.abs(score) * 8, 1);
            const bg = score > 0 ? `rgba(15, 110, 86, ${intensity})` : `rgba(160, 32, 32, ${intensity})`;
            return (
              <span key={w} className="shap-word" style={{ backgroundColor: bg }} title={`Contribution: ${score}`}>
                {word}
              </span>
            );
          })}
        </div>
      )}

      {explanation && explanation.error && <div className="explanation-error">{explanation.error}</div>}
    </div>
  );
}

export default SourceItem;