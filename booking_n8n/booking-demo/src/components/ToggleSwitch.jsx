import React from 'react';

const ToggleSwitch = ({ chatMode, onToggle }) => {
  return (
    <div className="toggle-container">
      <span className={`toggle-label ${!chatMode ? 'active' : ''}`} id="form-label">
        📋 Booking Form
      </span>
      <div
        className={`toggle-switch ${chatMode ? 'active' : ''}`}
        id="mode-toggle"
        onClick={onToggle}
      >
        <div className="toggle-knob"></div>
      </div>
      <span className={`toggle-label ${chatMode ? 'active' : ''}`} id="chat-label">
        💬 Chat Assistant
      </span>
    </div>
  );
};

export default ToggleSwitch;


