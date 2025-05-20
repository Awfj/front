import React from "react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  customContent = null,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center">
        <div
          className={`bg-white rounded-lg p-6 w-[90%] max-w-[400px] transform transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <h2 className="text-2xl font-medium mb-4">{title}</h2>
          <p className="text-dark-grey mb-6">{message}</p>

          {customContent && <div className="mb-4">{customContent}</div>}

          <div className="flex justify-end gap-4">
            <button
              onClick={onConfirm}
              className="btn-light rounded-md bg-red-500 transition-colors text-black"
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="btn-light rounded-md transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
