import React from "react";
import "../styles/ConfirmModal.css"; // Le damos estilo, luego te paso el CSS

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn-confirm" onClick={onConfirm}>
            Sí
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

