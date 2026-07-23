import React from "react";

function LogoSpinner({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 160 80"
      role="img"
      aria-label="LankaTaxMind is thinking"
    >
      <style>
        {`
          @keyframes ltm-pulse-1 { 0%,100% { opacity: 0.25; } 16%,33% { opacity: 1; } 50% { opacity: 0.25; } }
          @keyframes ltm-pulse-2 { 0%,16%,100% { opacity: 0.25; } 33%,50% { opacity: 1; } 66% { opacity: 0.25; } }
          @keyframes ltm-pulse-3 { 0%,33%,100% { opacity: 0.25; } 50%,66% { opacity: 1; } 83% { opacity: 0.25; } }
          .ltm-l { animation: ltm-pulse-1 2.4s ease-in-out infinite; }
          .ltm-t { animation: ltm-pulse-2 2.4s ease-in-out infinite; }
          .ltm-m { animation: ltm-pulse-3 2.4s ease-in-out infinite; }
        `}
      </style>
      <text className="ltm-l" x="15" y="55" fontFamily="Georgia, serif" fontWeight="700" fontSize="48" fill="#1E3A5F">
        L
      </text>
      <text className="ltm-t" x="60" y="55" fontFamily="Georgia, serif" fontWeight="700" fontSize="48" fill="#D4A947">
        T
      </text>
      <text className="ltm-m" x="105" y="55" fontFamily="Georgia, serif" fontWeight="700" fontSize="48" fill="#1E3A5F">
        M
      </text>
    </svg>
  );
}

export default LogoSpinner;