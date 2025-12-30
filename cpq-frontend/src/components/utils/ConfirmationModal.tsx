import React from "react";
import Modal from "react-modal";

// Make sure to call this once in your app (typically in index.js/App.js)
// Modal.setAppElement('#root');

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen?: boolean;
  isDisabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isOpen = true,
  isDisabled = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onCancel}
      className="flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      contentLabel={title}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={isDisabled}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${isDisabled ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'} text-white rounded`}
            disabled={isDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;