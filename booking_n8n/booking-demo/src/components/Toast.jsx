import React, { useEffect } from 'react';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return 'exclamation-triangle';
      case 'warning':
        return 'exclamation-circle';
      case 'success':
        return 'check-circle';
      default:
        return 'info-circle';
    }
  };

  return (
    <div className={`toast show ${type}`}>
      <i className={`fas fa-${getIcon()}`}></i>
      {message}
    </div>
  );
};

export default Toast;


