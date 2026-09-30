export default function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card glass modal animate-fade-in" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
