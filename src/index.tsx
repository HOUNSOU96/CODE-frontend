// src/components/UpdateBanner.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./components/ui/button";

interface UpdateBannerProps {
  waitingWorker: ServiceWorker | null;
  onUpdate: () => void;
}

const UpdateBanner: React.FC<UpdateBannerProps> = ({ waitingWorker, onUpdate }) => {
  if (!waitingWorker) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg flex items-center justify-between z-50 rounded-t-2xl"
      >
        <span className="font-medium">
          🚀 Nouvelle version de <strong>CODE</strong> disponible !
        </span>
        <Button
          onClick={onUpdate}
          className="bg-white text-blue-700 hover:bg-blue-100 font-semibold rounded-lg"
        >
          Mettre à jour
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateBanner;
