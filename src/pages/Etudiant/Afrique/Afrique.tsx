import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const sousDomaines = [
{
id: "cultures-africaines",
titre: "Cultures africaines",
description:
"Découverte des cultures, traditions, arts, valeurs et patrimoines des peuples africains.",
},
{
id: "economie-africaine",
titre: "Économie africaine",
description:
"Compréhension des économies africaines, des échanges, des ressources et des dynamiques économiques.",
},
{
id: "education-afrique",
titre: "Éducation en Afrique",
description:
"Systèmes éducatifs, histoire de l'éducation et innovations pédagogiques africaines.",
},
{
id: "entrepreneuriat-afrique",
titre: "Entrepreneuriat africain",
description:
"Création d'entreprises, innovation, commerce et développement des initiatives africaines.",
},
{
id: "geographie-afrique",
titre: "Géographie de l'Afrique",
description:
"Territoires, populations, reliefs, climats, ressources et espaces africains.",
},
{
id: "histoire-afrique",
titre: "Histoire de l'Afrique",
description:
"Grandes périodes, civilisations, royaumes, empires et événements historiques africains.",
},
{
id: "langues-africaines",
titre: "Langues africaines",
description:
"Découverte, apprentissage et valorisation des nombreuses langues parlées en Afrique.",
},
{
id: "sciences-technologies-afrique",
titre: "Sciences & technologies africaines",
description:
"Sciences, inventions, innovations et technologies développées en Afrique.",
},
];

const Afrique: React.FC = () => {
const navigate = useNavigate();

const handleChoice = (id: string) => {
navigate(`/domaines/afrique/${id}`);
};

return (
<motion.div
className="
min-h-screen
flex flex-col
items-center
justify-center
px-4
py-10
text-white
z-20
"
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -30 }}
transition={{ duration: 0.5 }}
> <div className="text-center mb-10 max-w-5xl"> <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
CODE </h1>

```
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">
      SAVOIRS & COMPÉTENCES AFRICAINS
    </h2>

    <p className="mt-4 text-sm sm:text-base text-gray-200 max-w-3xl mx-auto">
      Explorez les connaissances, les cultures, les langues, les sciences
      et les savoir-faire qui constituent les richesses du continent africain.
    </p>

    <p className="mt-3 text-sm sm:text-base italic font-semibold text-yellow-200">
      « Connaître l'Afrique, c'est aussi construire son avenir. »
    </p>
  </div>

  <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
    {sousDomaines.map((domaine) => (
      <div
        key={domaine.id}
        className="w-40 sm:w-44 md:w-48 h-48 perspective cursor-pointer"
      >
        <motion.div
          className="card-3d w-full h-full rounded-xl"
          animate={{ rotateY: [0, 360] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            repeatDelay: 10,
            ease: "easeInOut",
          }}
          onClick={() => handleChoice(domaine.id)}
          whileHover={{ scale: 1.05 }}
        >
          <div className="card-face flex flex-col items-center justify-center gap-3 bg-white/90 dark:bg-gray-700 shadow-lg rounded-xl p-4 text-center text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
            <div className="text-4xl">🌍</div>

            <div className="leading-tight">{domaine.titre}</div>

            <p className="text-xs font-normal text-gray-600 dark:text-gray-300 leading-snug">
              {domaine.description}
            </p>
          </div>

          <div
            className="card-face card-back bg-cover bg-center rounded-xl shadow-lg"
            style={{
              backgroundImage: "url('/coin.svg')",
            }}
          />
        </motion.div>
      </div>
    ))}
  </div>

  <div className="mt-10 max-w-3xl text-center text-sm sm:text-base text-gray-200">
    <p>
      <strong>CODE</strong> valorise les savoirs africains et leur transmission
      afin de contribuer à la construction d'une Afrique instruite, créative
      et innovante.
    </p>
  </div>

  <button
    onClick={() => navigate("/etudiant")}
    className="mt-10 px-6 py-3 bg-white/80 dark:bg-gray-600 hover:bg-white dark:hover:bg-gray-500 rounded-full text-sm text-gray-800 dark:text-white transition font-medium"
  >
    ⬅️ Retour
  </button>

  <style>{`
    .perspective {
      perspective: 1000px;
    }

    .card-3d {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    .card-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 1rem;
      padding: 10px;
    }

    .card-back {
      transform: rotateY(180deg);
    }
  `}</style>
</motion.div>


);
};

export default Afrique;
