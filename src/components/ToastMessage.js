// src/components/ToastMessage.jsx
import React, { useEffect } from "react";
import "../styles/ToastMessage.css";

const ToastMessage = ({ message, duration = 3000, onClose, type = "success" }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return <div className={`toast-message toast-${type}`}>{message}</div>;
};

export default ToastMessage;
