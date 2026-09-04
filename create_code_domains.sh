#!/bin/bash

BASE="src/pages/Etudiant"

# ==========================================================
# GRANDS DOMAINES ET SOUS-DOMAINES CODE
# ==========================================================

declare -A DOMAINES

DOMAINES[Academique]="Mathematiques Physique Chimie SciencesVie SciencesTerre Informatique Langues SciencesHumainesSociales LitteratureArts"

DOMAINES[Metiers]="Mecanique Electricite Construction Menuiserie Couture Agriculture Cuisine"

DOMAINES[Technologies]="Programmation IntelligenceArtificielle DataScience Robotique Electronique Reseaux Cybersecurite DesignNumerique"

DOMAINES[Professionnelle]="Entrepreneuriat Gestion Commerce Marketing Communication Management"

DOMAINES[Finance]="FinancePersonnelle Investissement Banque Economie Comptabilite Fiscalite"

DOMAINES[Environnement]="Ecologie Biodiversite Eau Climat EnergiesRenouvelables AgricultureDurable"

DOMAINES[DeveloppementHumain]="DeveloppementPersonnel PenseeCritique Leadership RelationsHumaines GestionTemps PriseDecision"

DOMAINES[Societe]="Droit Citoyennete Institutions Histoire Geographie Sociologie Anthropologie Medias"

DOMAINES[Sante]="Medecine Pharmacie SoinsInfirmiers Nutrition Hygiene SantePublique"

DOMAINES[SciencesInnovation]="Astronomie SciencesPhysiques SciencesChimiques Biotechnologies Materiaux Nanotechnologies SciencesSpatiales"

DOMAINES[Pedagogie]="PedagogieGenerale Didactique Evaluation PsychologieEducation IngenieriePedagogique TechnologiesEducatives"

DOMAINES[Jeux]="Echecs JeuxStrategie JeuxMathematiques Puzzles JeuxSociete GameDesign"

DOMAINES[Arts]="Musique ArtsPlastiques Danse Theatre Cinema Photographie"

DOMAINES[Recherche]="Methodologie RedactionScientifique Statistiques AnalyseDonnees Bibliographie CommunicationScientifique"

DOMAINES[Afrique]="HistoireAfrique GeographieAfrique CulturesAfricaines LanguesAfricaines EconomieAfricaine SciencesTechnologiesAfrique EducationAfrique EntrepreneuriatAfrique"

DOMAINES[Autres]="CultureGenerale VieQuotidienne Loisirs CompetencesTransversales"


# ==========================================================
# CRÉATION
# ==========================================================

mkdir -p "$BASE"

for domaine in "${!DOMAINES[@]}"
do

    echo "📁 Création du domaine : $domaine"

    mkdir -p "$BASE/$domaine"

    # Fichier principal du domaine
    cat > "$BASE/$domaine/$domaine.tsx" <<EOF
import React from "react";
import { useNavigate } from "react-router-dom";

const $domaine: React.FC = () => {

  const navigate = useNavigate();

  const sousDomaines = [
EOF

    for sousDomaine in ${DOMAINES[$domaine]}
    do

        cat >> "$BASE/$domaine/$domaine.tsx" <<EOF
    {
      name: "$sousDomaine",
      label: "$sousDomaine",
    },
EOF

        cat > "$BASE/$domaine/$sousDomaine.tsx" <<EOF
import React from "react";
import { useNavigate } from "react-router-dom";

const $sousDomaine: React.FC = () => {

  const navigate = useNavigate();

  const apprentissages = [
    // Les apprentissages de "$sousDomaine" seront ajoutés ici.
  ];

  const handleApprentissage = (apprentissage: string) => {

    navigate(
      \`/evaluation/$domaine/$sousDomaine/\${encodeURIComponent(apprentissage)}\`
    );

  };

  return (
    <div className="min-h-screen px-4 py-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-center mb-10">
          $sousDomaine
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

export default $sousDomaine;
EOF

    done

    cat >> "$BASE/$domaine/$domaine.tsx" <<EOF
  ];

  const handleSousDomaine = (sousDomaine: string) => {

    navigate(
      \`/domaines/$domaine/\${sousDomaine}\`
    );

  };

  return (
    <div className="min-h-screen px-4 py-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-4">
          $domaine
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

export default $domaine;
EOF

done


# ==========================================================
# EVALUATION
# ==========================================================

mkdir -p "$BASE/Evaluation"

echo "✅ Structure CODE créée."

echo
echo "📊 Vérification :"
find "$BASE" -type f | sort