import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal-content" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <strong>{title}</strong>
              <button className="btn pill teal" onClick={onClose}>Close</button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-actions">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
