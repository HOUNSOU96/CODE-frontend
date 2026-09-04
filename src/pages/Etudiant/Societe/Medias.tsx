import React from "react";
import { useNavigate } from "react-router-dom";

const Medias: React.FC = () => {

  const navigate = useNavigate();

  const apprentissages = [
    // Les apprentissages de "Medias" seront ajoutés ici.
  ];

  const handleApprentissage = (apprentissage: string) => {

    navigate(
      `/evaluation/Societe/Medias/${encodeURIComponent(apprentissage)}`
    );

  };

  return (
    <div className="min-h-screen px-4 py-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-10">
          Medias
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

          {apprentissages.map((apprentissage) => (

            <button
              key={apprentissage}
              onClick={() => handleApprentissage(apprentissage)}
              className="
                p-6
                rounded-2xl
                bg-white
                dark:bg-gray-800
                shadow-lg
                hover:shadow-xl
                hover:-translate-y-1
                transition
                text-center
                font-semibold
              "
            >

              {apprentissage}

            </button>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Medias;
