import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bark-darkest/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-parchment border border-parchment-border rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden transform transition-all p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-serif font-bold text-bark-darkest text-base">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-bark-pale hover:text-bark-dark hover:bg-white/50 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs font-sans text-bark-mid mb-5 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="btn-bark-outline text-xs py-1.5 px-3.5"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`font-serif rounded transition-colors duration-150 text-xs py-1.5 px-3.5 ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white font-serif'
                : 'btn-bark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmationModal;
