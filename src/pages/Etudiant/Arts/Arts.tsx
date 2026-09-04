import React from "react";
import { useNavigate } from "react-router-dom";

const Arts: React.FC = () => {

  const navigate = useNavigate();

  const sousDomaines = [
    {
      name: "Musique",
      label: "Musique",
    },
    {
      name: "ArtsPlastiques",
      label: "ArtsPlastiques",
    },
    {
      name: "Danse",
      label: "Danse",
    },
    {
      name: "Theatre",
      label: "Theatre",
    },
    {
      name: "Cinema",
      label: "Cinema",
    },
    {
      name: "Photographie",
      label: "Photographie",
    },
  ];

  const handleSousDomaine = (sousDomaine: string) => {

    navigate(
      `/domaines/Arts/${sousDomaine}`
    );

  };

  return (
    <div className="min-h-screen px-4 py-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          Arts
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
          Choisissez un sous-domaine
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {sousDomaines.map((sousDomaine) => (

            <button
              key={sousDomaine.name}
              onClick={() => handleSousDomaine(sousDomaine.name)}
              className="
                p-6
                rounded-2xl
                bg-white
                dark:bg-gray-800
                shadow-lg
                hover:shadow-xl
                hover:-translate-y-1
                transition
                font-semibold
              "
            >

              {sousDomaine.label}

            </button>

          ))}

        </div>

      </div>

    </div>
  );
};

export default Arts;
