interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      data-testid="confirm-modal-overlay"
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        data-testid="confirm-modal"
        style={{
          background: '#fff', borderRadius: '12px', padding: '24px',
          minWidth: '360px', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', color: '#666', lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            data-testid="confirm-modal-cancel-button"
            onClick={onCancel}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd',
              background: '#fff', cursor: 'pointer', fontSize: '14px',
            }}
          >
            {cancelLabel}
          </button>
          <button
            data-testid="confirm-modal-confirm-button"
            onClick={onConfirm}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: '#e53935', color: '#fff', cursor: 'pointer', fontSize: '14px',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
