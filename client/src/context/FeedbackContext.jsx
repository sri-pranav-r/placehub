import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import Modal from '../components/Modal';

// Toast notifications + a promise-based confirm dialog (replaces window.confirm)
const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const resolver = useRef(null);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, type = 'success') => {
      const id = crypto.randomUUID();
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const confirm = useCallback((options) => {
    setConfirmState(typeof options === 'string' ? { message: options } : options);
    return new Promise((resolve) => (resolver.current = resolve));
  }, []);

  const close = (answer) => {
    resolver.current?.(answer);
    setConfirmState(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{t.message}</span>
            <button className="icon-btn" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <Modal open={Boolean(confirmState)} title={confirmState?.title || 'Are you sure?'} onClose={() => close(false)} size="sm">
        <p className="muted">{confirmState?.message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={() => close(false)}>
            Cancel
          </button>
          <button className={`btn ${confirmState?.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => close(true)}>
            {confirmState?.confirmLabel || 'Confirm'}
          </button>
        </div>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export const useToast = () => useContext(FeedbackContext).toast;
export const useConfirm = () => useContext(FeedbackContext).confirm;
