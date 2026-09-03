// src/components/RoleBadge.jsx
import React from "react";

const ROLE_CONFIG = {
  ADMIN: {
    label: "Admin",
    fullLabel: "System Administrator",
    className: "bg-neo-muted text-black",
  },
  STORE_OWNER: {
    label: "Owner",
    fullLabel: "Store Owner",
    className: "bg-neo-secondary text-black",
  },
  USER: {
    label: "User",
    fullLabel: "Normal User",
    className: "bg-neo-bg text-black",
  },
};

const RoleBadge = ({ role, short = false, rotate = false }) => {
  const config = ROLE_CONFIG[role] || {
    label: role || "Unknown",
    fullLabel: role || "Unknown",
    className: "bg-white text-black",
  };

  const displayText = short ? config.label : config.fullLabel;

  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-black px-3 py-0.5 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] ${
        rotate ? "-rotate-2" : ""
      } ${config.className}`}
    >
      {displayText}
    </span>
  );
};

export default RoleBadge;
