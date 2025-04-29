import React from "react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-[400px]">
        <h2 className="text-2xl font-medium mb-4">{title}</h2>
        <p className="text-dark-grey mb-6">{message}</p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onConfirm}
            className="btn-light rounded-md bg-red-500 text-black"
          >
            {confirmText}
          </button>
          <button onClick={onClose} className="btn-light rounded-md">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
