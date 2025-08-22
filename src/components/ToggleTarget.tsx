import React from "react";

interface ToggleTargetProps {
  target: 25 | 30;
  onToggle: () => void;
}

const ToggleTarget: React.FC<ToggleTargetProps> = ({ target, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="bg-blue-500 text-white px-3 py-1 rounded-md font-medium hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
      aria-pressed={target === 30}
      aria-label={`Toggle between 25g and 30g, currently ${target}g`}
    >
      ${target}g
    </button>
  );
};

export default ToggleTarget;
