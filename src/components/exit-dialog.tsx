
import React from 'react';

interface ExitDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ExitDialog: React.FC<ExitDialogProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/5 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2b2b] backdrop-blur-md rounded-xl p-6 w-full mx-4 max-w-sm border border-white/10">
        <h3 className="text-lg font-medium text-white mb-2 text-left">
          Exit
        </h3>
        <p className="text-sm text-gray-400 mb-6 text-left">
          Do you want to exit the app?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="text-sm text-red-300 hover:text-red-400 font-medium px-4"
          >
            NO
          </button>
          <button
            onClick={onConfirm}
            className="text-sm text-red-500 hover:text-red-600 font-medium px-4"
          >
            YES
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitDialog;