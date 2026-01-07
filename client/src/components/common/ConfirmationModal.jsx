import { Button } from '../ui/Button.jsx'
import { Modal } from '../ui/Modal.jsx'
import { AlertTriangle } from 'lucide-react'

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  loading = false 
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-6 p-2">
      <div className="flex items-start gap-4 p-6 bg-destructive/10 border border-destructive/30 rounded-2xl">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <p className="text-lg leading-relaxed text-destructive-foreground">{message}</p>
      </div>
      
      <div className="flex gap-4 pt-2">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex-1 h-14"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="destructive"
          className="flex-1 h-14 font-semibold"
          disabled={loading}
        >
          {loading ? 'Deleting...' : confirmText}
        </Button>
      </div>
    </div>
  </Modal>
)

export { ConfirmationModal }
