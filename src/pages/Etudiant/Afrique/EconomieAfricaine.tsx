import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const apprentissages = [
{ id: "ressources-africaines", titre: "Ressources africaines" },
{ id: "agriculture-africaine", titre: "Agriculture africaine" },
{ id: "commerce-africain", titre: "Commerce africain" },
{ id: "industrialisation", titre: "Industrialisation" },
{ id: "integration-regionale", titre: "Intégration régionale" },
{ id: "economie-numerique", titre: "Économie numérique" },
{ id: "developpement-economique", titre: "Développement économique" },
];

const EconomieAfricaine: React.FC = () => {
const navigate = useNavigate();

return (
<motion.div
className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-white z-20"
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
> <div className="text-center mb-10 max-w-5xl"> <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">CODE</h1> <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2">
ÉCONOMIE AFRICAINE </h2> <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
Comprenez les principales activités, ressources et dynamiques
économiques du continent africain. </p> </div>

```
  <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
    {apprentissages.map((item) => (
      <motion.div
        key={item.id}
        className="w-40 sm:w-44 md:w-48 h-48 perspective cursor-pointer"
        whileHover={{ scale: 1.05 }}
        onClick={() =>
          navigate(`/evaluation/afrique/economie-africaine/${item.id}`)
        }
      >
        <div className="card-3d w-full h-full">
          <div className="card-face flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center text-gray-800 dark:text-white font-semibold">
            <div className="text-4xl">📈</div>
            <div>{item.titre}</div>
          </div>
          <div
            className="card-face card-back bg-cover bg-center rounded-xl"
            style={{ backgroundImage: "url('/coin.svg')" }}
          />
        </div>
      </motion.div>
    ))}
  </div>

  <button
    onClick={() => navigate("/domaines/afrique")}
    className="mt-10 px-6 py-3 bg-white/80 dark:bg-gray-600 hover:bg-white rounded-full text-sm text-gray-800 dark:text-white transition font-medium"
  >
    ⬅️ Retour
  </button>

  <style>{`
    .perspective { perspective: 1000px; }
    .card-3d { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
    .card-face { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 1rem; padding: 10px; }
    .card-back { transform: rotateY(180deg); }
  `}</style>
</motion.div>


);
};

export default EconomieAfricaine;
