import { motion, AnimatePresence } from 'framer-motion';
export default function LoadingOverlay({ isLoading, text = "Analyzing Intelligence..." }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loading-spinner" />
          <div className="loading-text">{text}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
