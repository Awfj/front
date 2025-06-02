import React, { useState } from "react";

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
          <p className="text-dark-grey mb-4">{message}</p>

          {customContent && <div className="mb-6">{customContent}</div>}

          <div className="flex justify-end gap-4">
            {confirmText !== "Cancel" && (
              <button
                onClick={onConfirm}
                className="btn-light rounded-md bg-red-500 transition-colors text-black"
              >
                {confirmText}
              </button>
            )}
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

export const ConfirmDialogModetation = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  customContent = null,
}) => {
  // Добавляем состояние для комментария
  const [comment, setComment] = useState("");

  // Сброс комментария при открытии/закрытии
  React.useEffect(() => {
    if (!isOpen) setComment("");
  }, [isOpen]);

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

          {/* Если customContent — это textarea, прокидываем value и onChange */}
          {customContent
            ? React.cloneElement(customContent, {
                value: comment,
                onChange: (e) => setComment(e.target.value),
              })
            : null}

          <div className="flex justify-end gap-4">
            {confirmText !== "Cancel" && (
              <button
                onClick={() => onConfirm(comment)}
                className="btn-light rounded-md bg-red-500 transition-colors text-black"
              >
                {confirmText}
              </button>
            )}
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
