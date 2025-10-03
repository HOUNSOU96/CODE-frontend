import React from "react";
import { CheckCircle, Clock, Video } from "lucide-react";
import { motion } from "framer-motion";

interface ProgressionData {
  statut: "en_attente" | "en_cours" | "valide";
  niveauActuel: string;
  niveauMax: string;
  testTermine?: boolean;
  testScore?: number;
}

interface SuiviProps {
  progression: Record<string, ProgressionData>;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "valide":
      return <CheckCircle className="text-green-500" />;
    case "en_cours":
      return <Video className="text-blue-500" />;
    default:
      return <Clock className="text-gray-400" />;
  }
};

const TableauSuivi: React.FC<SuiviProps> = ({ progression }) => {
  const notions = Object.keys(progression);

  return (
    <motion.div
      className="p-4 bg-white shadow rounded-xl w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-xl font-bold mb-4">Suivi de progression</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notions.map((notion) => {
          const data = progression[notion];
          return (
            <div
              key={notion}
              className="border p-4 rounded-xl flex flex-col justify-between bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-md">{notion}</h3>
                {getStatusIcon(data.statut)}
              </div>
              <div className="text-sm mt-2">
                Niveau actuel : <strong>{data.niveauActuel}</strong> <br />
                Niveau max : <strong>{data.niveauMax}</strong>
              </div>
              {data.testTermine && (
                <div className="mt-2 text-sm text-green-700">
                  Test réussi : {data.testScore}/20
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TableauSuivi;
