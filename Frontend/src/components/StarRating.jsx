// src/components/StarRating.jsx
import React, { useState } from "react";

const StarIcon = ({ filled = false, size = 16, className = "" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#FFD93D" : "#FFFFFF"}
    stroke="#000000"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const StarRating = ({
  value = 0,
  count = null,
  interactive = false,
  onChange = null,
  disabled = false,
  showValue = true,
  size = 18,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  if (interactive) {
    const activeRating = hoverValue || value || 0;
    const starSize = 26;

    return (
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 p-1 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000]"
          onMouseLeave={() => setHoverValue(0)}
          role="radiogroup"
          aria-label="Rating score out of 5 stars"
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= activeRating;
            return (
              <button
                key={star}
                type="button"
                disabled={disabled}
                onClick={() => onChange && onChange(star)}
                onMouseEnter={() => setHoverValue(star)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                role="radio"
                aria-checked={value === star}
                className={`p-1 transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none ${
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
              >
                <StarIcon
                  size={starSize}
                  filled={isFilled}
                />
              </button>
            );
          })}
        </div>
        {showValue && (
          <span className="inline-block px-2.5 py-1 bg-neo-secondary border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] tabular-nums">
            {value > 0 ? `${value} / 5 STARS` : "SELECT RATING"}
          </span>
        )}
      </div>
    );
  }

  // Static display mode
  const roundedValue = value !== null && value !== undefined ? Math.round(value) : 0;

  return (
    <div className="inline-flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            size={size}
            filled={star <= roundedValue}
          />
        ))}
      </div>
      {value !== null && value !== undefined ? (
        <span className="font-black text-sm text-black tabular-nums">
          {Number(value).toFixed(1)}
        </span>
      ) : (
        <span className="text-xs font-bold text-ink-muted uppercase">Unrated</span>
      )}
      {count !== null && count !== undefined && (
        <span className="text-xs font-bold text-black tabular-nums">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
