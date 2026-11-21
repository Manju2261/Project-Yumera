import './ConfirmationModal.css'

function ConfirmationModal({ message, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="confirmation-modal">
                <h2>Are you sure?</h2>

                <p>{message}</p>

                <div className="modal-actions">
                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>

                    <button type="button" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmationModal