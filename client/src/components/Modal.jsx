import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Native <dialog> gives focus trapping, Esc-to-close and a backdrop for free
export default function Modal({ open, title, subtitle, onClose, size = 'md', children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal modal-${size}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="modal-inner">
          <header className="modal-header">
            <div>
              <h2>{title}</h2>
              {subtitle && <p className="muted">{subtitle}</p>}
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </header>
          <div className="modal-body">{children}</div>
        </div>
      )}
    </dialog>
  );
}
