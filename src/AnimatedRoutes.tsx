// 📁 src/AnimatedRoutes.tsx

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";

// ==========================================================
// ADMIN
// ==========================================================

import ParrainDetails from "@/pages/admin/ParrainDetails";
import HistoriqueConnections from "@/pages/admin/HistoriqueConnections";



// ==================================================
// QUESTIONS — UTILISATEUR
// ==================================================
import MesQuestions from "./pages/Questions/MesQuestions";
import NouvelleQuestion from "./pages/Questions/NouvelleQuestion";
import Conversation from "./pages/Questions/Conversation";

// ==================================================
// ENSEIGNANT
// ==================================================
import QuestionsEnseignant from "./pages/Enseignant/QuestionsEnseignant";
import ConversationEnseignant from "./pages/Enseignant/ConversationEnseignant";

// ==================================================
// ADMIN — QUESTIONS ET ENSEIGNANTS
// ==================================================
import QuestionsAdmin from "./pages/admin/QuestionsAdmin";
import ConversationAdmin from "./pages/admin/ConversationAdmin";
import GestionEnseignants from "./pages/admin/GestionEnseignants";



// ==========================================================
// PAGES PUBLIQUES
// ==========================================================

import Page1 from "./pages/Page1";
import Page2 from "./pages/Page2";
import Login from "./pages/Login";
import Activation from "./pages/Activation";
import Inscription from "./pages/Inscription";
import Etudiant from "./pages/Etudiant";
import RemediationVideo from "./pages/Maths/Test/RemediationVideo/RemediationVideo";
import VideoPlayer from "./pages/VideoPlayer";

import Dashboard from "./pages/AdminDashboard/Dashboard";
import AdminDocuments from "./pages/AdminDocuments";
import AdminActivationCodes from "./pages/AdminActivationCodes";
import ListeInscrits from "./pages/ListeInscrits";
import ConversationsEnseignantsAdmin from "./pages/admin/ConversationsEnseignantsAdmin";
import ProfilEnseignant from "./pages/Enseignant/ProfilEnseignant";
import Enseignant from "./pages/Enseignant/Enseignant";
// ==========================================================
// PAGES PROTÉGÉES — ANCIENNE STRUCTURE
// ==========================================================

import Accueil from "./pages/Accueil";
import Matiere from "./pages/Matiere";

import Homemaths from "./pages/Home/Homemaths";
import Homephysique from "./pages/Home/Homephysique";
import Homechimie from "./pages/Home/Homechimie";
import Hometechnologie from "./pages/Home/Hometechnologie";
import Homeanglais from "./pages/Home/Homeanglais";
import Homesvt from "./pages/Home/Homesvt";
import Homephilosophie from "./pages/Home/Homephilosophie";
import Homeintelligenceartificielle from "./pages/Home/Homeintelligenceartificielle";
import Homeallemand from "./pages/Home/Homeallemand";
import Homebasketball from "./pages/Home/Homebasketball";
import Homebatterie from "./pages/Home/Homebatterie";
import Homebricolage from "./pages/Home/Homebricolage";
import Homechant from "./pages/Home/Homechant";
import Homechine from "./pages/Home/Homechine";
import Homeenchainement from "./pages/Home/Homeenchainement";
import Homeespagnole from "./pages/Home/Homeespagnole";
import Homefootball from "./pages/Home/Homefootball";
import Homevoleyball from "./pages/Home/Homevoleyball";
import Homefon from "./pages/Home/Homefon";
import Homefrançais from "./pages/Home/Homefrançais";

import Homegeographieafrique from "./pages/Home/Homegeographieafrique";
import Homegeographieamerique from "./pages/Home/Homegeographieamerique";
import Homegeographieasie from "./pages/Home/Homegeographieasie";
import Homegeographiebenin from "./pages/Home/Homegeographiebenin";
import Homegeographiechine from "./pages/Home/Homegeographiechine";
import Homegeographieetatsunis from "./pages/Home/Homegeographieetatsunis";
import Homegeographiefrance from "./pages/Home/Homegeographiefrance";
import Homegeographieinde from "./pages/Home/Homegeographieinde";
import Homegeographiejapon from "./pages/Home/Homegeographiejapon";
import Homegeographierussie from "./pages/Home/Homegeographierussie";
import Homegeographieurss from "./pages/Home/Homegeographieurss";

import Homegrimper from "./pages/Home/Homegrimper";
import Homeguitare from "./pages/Home/Homeguitare";
import Homegymnastique from "./pages/Home/Homegymnastique";

import Homehistoireafrique from "./pages/Home/Homehistoireafrique";
import Homehistoireamerique from "./pages/Home/Homehistoireamerique";
import Homehistoireasie from "./pages/Home/Homehistoireasie";
import Homehistoirebenin from "./pages/Home/Homehistoirebenin";
import Homehistoirechine from "./pages/Home/Homehistoirechine";
import Homehistoireetatsunis from "./pages/Home/Homehistoireetatsunis";
import Homehistoirefrance from "./pages/Home/Homehistoirefrance";
import Homehistoireinde from "./pages/Home/Homehistoireinde";
import Homehistoirejapon from "./pages/Home/Homehistoirejapon";
import Homehistoirerussie from "./pages/Home/Homehistoirerussie";
import Homehistoireurss from "./pages/Home/Homehistoireurss";

import Homehtmlcss from "./pages/Home/Homehtmlcss";
import Homejavascript from "./pages/Home/Homejavascript";
import Homejeux from "./pages/Home/Homejeux";
import Homepython from "./pages/Home/Homepython";

import Homelangagec from "./pages/Home/Homelangagec";
import Homelangagecplusplus from "./pages/Home/Homelangagecplusplus";
import Homelangager from "./pages/Home/Homelangager";

import Homelibertefinanciere from "./pages/Home/Homelibertefinanciere";

import Homepiano from "./pages/Home/Homepiano";
import Homeproverbesetvertus from "./pages/Home/Homeproverbesetvertus";

import Homesautenhauteur from "./pages/Home/Homesautenhauteur";
import Homesautenlongueur from "./pages/Home/Homesautenlongueur";
import Hometriplesaut from "./pages/Home/Hometriplesaut";

// ==========================================================
// MATIÈRES — ANCIENNE STRUCTURE
// ==========================================================

import Matieresdivertissement from "./pages/Matieres/Matieresdivertissement";
import Matiereseps from "./pages/Matieres/Matiereseps";
import Matieresgeographie from "./pages/Matieres/Matieresgeographie";
import Matiereshistoire from "./pages/Matieres/Matiereshistoire";
import Matieresinformatique from "./pages/Matieres/Matieresinformatique";
import Matiereslangue from "./pages/Matieres/Matiereslangue";
import Matieresmusique from "./pages/Matieres/Matieresmusique";
import Matierespct from "./pages/Matieres/Matierespct";

// ==========================================================
// CODE — UNIVERS DU SAVOIR ET DES COMPÉTENCES
// ==========================================================

// ----------- GRANDS DOMAINES -----------

import Academique from "./pages/Etudiant/Academique/Academique";
import Mathematiques from "./pages/Etudiant/Academique/Mathematiques";
import Physique from "./pages/Etudiant/Academique/Physique";
import Chimie from "./pages/Etudiant/Academique/Chimie";
import Informatique from "./pages/Etudiant/Academique/Informatique";
import Langues from "./pages/Etudiant/Academique/Langues";
import LitteratureArts from "./pages/Etudiant/Academique/LitteratureArts";
import SciencesHumainesSociales from "./pages/Etudiant/Academique/SciencesHumainesSociales";
import SciencesTerre from "./pages/Etudiant/Academique/SciencesTerre";
import SciencesVie from "./pages/Etudiant/Academique/SciencesVie";
import Afrique from "./pages/Etudiant/Afrique/Afrique";
import CulturesAfricaines from "./pages/Etudiant/Afrique/CulturesAfricaines";
import EconomieAfricaine from "./pages/Etudiant/Afrique/EconomieAfricaine";
import EducationAfrique from "./pages/Etudiant/Afrique/EducationAfrique";
import EntrepreneuriatAfrique from "./pages/Etudiant/Afrique/EntrepreneuriatAfrique";
import GeographieAfrique from "./pages/Etudiant/Afrique/GeographieAfrique";
import HistoireAfrique from "./pages/Etudiant/Afrique/HistoireAfrique";
import LanguesAfricaines from "./pages/Etudiant/Afrique/LanguesAfricaines";
import SciencesTechnologiesAfrique from "./pages/Etudiant/Afrique/SciencesTechnologiesAfrique";


import Arts from "./pages/Etudiant/Arts/Arts";
import Autres from "./pages/Etudiant/Autres/Autres";
import DeveloppementHumain from "./pages/Etudiant/DeveloppementHumain/DeveloppementHumain";
import Environnement from "./pages/Etudiant/Environnement/Environnement";
import Finance from "./pages/Etudiant/Finance/Finance";
import Jeux from "./pages/Etudiant/Jeux/Jeux";
import Metiers from "./pages/Etudiant/Metiers/Metiers";
import Pedagogie from "./pages/Etudiant/Pedagogie/Pedagogie";
import Professionnelle from "./pages/Etudiant/Professionnelle/Professionnelle";
import Recherche from "./pages/Etudiant/Recherche/Recherche";
import Sante from "./pages/Etudiant/Sante/Sante";
import SciencesInnovation from "./pages/Etudiant/SciencesInnovation/SciencesInnovation";
import Societe from "./pages/Etudiant/Societe/Societe";
import Technologies from "./pages/Etudiant/Technologies/Technologies";


import ArtsPlastiques from "./pages/Etudiant/Arts/ArtsPlastiques";
import Cinema from "./pages/Etudiant/Arts/Cinema";
import Danse from "./pages/Etudiant/Arts/Danse";
import Musique from "./pages/Etudiant/Arts/Musique";
import Photographie from "./pages/Etudiant/Arts/Photographie";
import Theatre from "./pages/Etudiant/Arts/Theatre";



import CompetencesTransversales from "./pages/Etudiant/Autres/CompetencesTransversales";
import CultureGenerale from "./pages/Etudiant/Autres/CultureGenerale";
import Loisirs from "./pages/Etudiant/Autres/Loisirs";
import VieQuotidienne from "./pages/Etudiant/Autres/VieQuotidienne";



import DeveloppementPersonnel from "./pages/Etudiant/DeveloppementHumain/DeveloppementPersonnel";
import GestionTemps from "./pages/Etudiant/DeveloppementHumain/GestionTemps";
import Leadership from "./pages/Etudiant/DeveloppementHumain/Leadership";
import PenseeCritique from "./pages/Etudiant/DeveloppementHumain/PenseeCritique";
import PriseDecision from "./pages/Etudiant/DeveloppementHumain/PriseDecision";
import RelationsHumaines from "./pages/Etudiant/DeveloppementHumain/RelationsHumaines";




import AgricultureDurable from "./pages/Etudiant/Environnement/AgricultureDurable";
import Biodiversite from "./pages/Etudiant/Environnement/Biodiversite";
import Climat from "./pages/Etudiant/Environnement/Climat";
import Eau from "./pages/Etudiant/Environnement/Eau";
import Ecologie from "./pages/Etudiant/Environnement/Ecologie";
import GestionDechets from "./pages/Etudiant/Environnement/GestionDechets";





import Banque from "./pages/Etudiant/Finance/Banque";
import Comptabilite from "./pages/Etudiant/Finance/Comptabilite";
import Economie from "./pages/Etudiant/Finance/Economie";
import FinancePersonnelle from "./pages/Etudiant/Finance/FinancePersonnelle";
import Fiscalite from "./pages/Etudiant/Finance/Fiscalite";
import Investissement from "./pages/Etudiant/Finance/Investissement";





import Echecs from "./pages/Etudiant/Jeux/Echecs";
import GameDesign from "./pages/Etudiant/Jeux/GameDesign";
import JeuxMathematiques from "./pages/Etudiant/Jeux/JeuxMathematiques";
import JeuxSociete from "./pages/Etudiant/Jeux/JeuxSociete";
import JeuxStrategie from "./pages/Etudiant/Jeux/JeuxStrategie";
import Puzzles from "./pages/Etudiant/Jeux/Puzzles";





import Agriculture from "./pages/Etudiant/Metiers/Agriculture";
import Construction from "./pages/Etudiant/Metiers/Construction";
import Couture from "./pages/Etudiant/Metiers/Couture";
import Cuisine from "./pages/Etudiant/Metiers/Cuisine";
import Electricite from "./pages/Etudiant/Metiers/Electricite";
import Mecanique from "./pages/Etudiant/Metiers/Mecanique";
import Menuiserie from "./pages/Etudiant/Metiers/Menuiserie";  



import Didactique from "./pages/Etudiant/Pedagogie/Didactique";
import EvaluationPedagogique from "./pages/Etudiant/Pedagogie/Evaluation";
import IngenieriePedagogique from "./pages/Etudiant/Pedagogie/IngenieriePedagogique";
import PedagogieGenerale from "./pages/Etudiant/Pedagogie/PedagogieGenerale";
import PsychologieEducation from "./pages/Etudiant/Pedagogie/PsychologieEducation";
import TechnologiesEducatives from "./pages/Etudiant/Pedagogie/TechnologiesEducatives";




import Commerce from "./pages/Etudiant/Professionnelle/Commerce";
import Communication from "./pages/Etudiant/Professionnelle/Communication";
import Entrepreneuriat from "./pages/Etudiant/Professionnelle/Entrepreneuriat";
import Gestion from "./pages/Etudiant/Professionnelle/Gestion";
import Management from "./pages/Etudiant/Professionnelle/Management";
import Marketing from "./pages/Etudiant/Professionnelle/Marketing";




import AnalyseDonnees from "./pages/Etudiant/Recherche/AnalyseDonnees";
import Bibliographie from "./pages/Etudiant/Recherche/Bibliographie";
import CommunicationScientifique from "./pages/Etudiant/Recherche/CommunicationScientifique";
import Methodologie from "./pages/Etudiant/Recherche/Methodologie";
import RedactionScientifique from "./pages/Etudiant/Recherche/RedactionScientifique";
import StatistiquesRecherche from "./pages/Etudiant/Recherche/Statistiques";





import Hygiene from "./pages/Etudiant/Sante/Hygiene";
import Medecine from "./pages/Etudiant/Sante/Medecine";
import Nutrition from "./pages/Etudiant/Sante/Nutrition";
import Pharmacie from "./pages/Etudiant/Sante/Pharmacie";
import SantePublique from "./pages/Etudiant/Sante/SantePublique";
import SoinsInfirmiers from "./pages/Etudiant/Sante/SoinsInfirmiers";



import Astronomie from "./pages/Etudiant/SciencesInnovation/Astronomie";
import Biotechnologies from "./pages/Etudiant/SciencesInnovation/Biotechnologies";
import Materiaux from "./pages/Etudiant/SciencesInnovation/Materiaux";
import Nanotechnologies from "./pages/Etudiant/SciencesInnovation/Nanotechnologies";
import SciencesChimiques from "./pages/Etudiant/SciencesInnovation/SciencesChimiques";
import SciencesPhysiques from "./pages/Etudiant/SciencesInnovation/SciencesPhysiques";
import SciencesSpatiales from "./pages/Etudiant/SciencesInnovation/SciencesSpatiales";





import Anthropologie from "./pages/Etudiant/Societe/Anthropologie";
import Citoyennete from "./pages/Etudiant/Societe/Citoyennete";
import Droit from "./pages/Etudiant/Societe/Droit";
import Geographie from "./pages/Etudiant/Societe/Geographie";
import Histoire from "./pages/Etudiant/Societe/Histoire";
import Institutions from "./pages/Etudiant/Societe/Institutions";
import Medias from "./pages/Etudiant/Societe/Medias";
import Sociologie from "./pages/Etudiant/Societe/Sociologie";





import Cybersecurite from "./pages/Etudiant/Technologies/Cybersecurite";
import DataScience from "./pages/Etudiant/Technologies/DataScience";
import DesignNumerique from "./pages/Etudiant/Technologies/DesignNumerique";
import Electronique from "./pages/Etudiant/Technologies/Electronique";
import IntelligenceArtificielle from "./pages/Etudiant/Technologies/IntelligenceArtificielle";
import Programmation from "./pages/Etudiant/Technologies/Programmation";
import Reseaux from "./pages/Etudiant/Technologies/Reseaux";
import Robotique from "./pages/Etudiant/Technologies/Robotique";







// ----------- ÉVALUATION UNIQUE -----------

import Evaluation from "./pages/Evaluation";

// ==========================================================
// TESTS — ANCIEN SYSTÈME MATHS
// ==========================================================

import Questions from "./pages/Maths/Test/Questions/Questions";
import Resultats from "./pages/Maths/Test/Resultats/Resultats";
import Remediation from "./pages/Maths/Test/Remediation/Remediation";

// ==========================================================
// ANCIEN SYSTÈME — AUTRES PAGES
// ==========================================================

import Homefanfare from "./pages/Home/Homefanfare";
import Hometrompette from "./pages/Home/Hometrompette";
import Hometrading from "./pages/Home/Hometrading";
import Home1xbet from "./pages/Home/Home1xbet";

// ==========================================================
// PAGES PROTÉGÉES
// ==========================================================

const protectedPages = [

  // --------------------------------------------------------
  // PAGES GÉNÉRALES
  // --------------------------------------------------------

  {
    path: "/page2",
    Component: Page2,
  },

  {
    path: "/accueil",
    Component: () => (
      <Accueil
        videos={[
          "/videos/pub1.mp4",
          // "/videos/video2.mp4",
          // "/videos/video3.mp4",
        ]}
        skipDelay={5}
      />
    ),
  },

  {
    path: "/matiere",
    Component: Matiere,
  },

  {
    path: "/etudiant",
    Component: Etudiant,
  },

  // ========================================================
  // CODE — GRANDS DOMAINES
  // ========================================================

  {
    path: "/domaines/academique",
    Component: Academique,
  },

  
  // ========================================================
  // ANCIENNES PAGES HOME
  // ========================================================

  {
    path: "/home/homemaths",
    Component: Homemaths,
  },

  {
    path: "/home/homefanfare",
    Component: Homefanfare,
  },

  {
    path: "/home/hometrompette",
    Component: Hometrompette,
  },

  {
    path: "/home/homephysique",
    Component: Homephysique,
  },

  {
    path: "/home/homesvt",
    Component: Homesvt,
  },

  {
    path: "/home/hometrading",
    Component: Hometrading,
  },

  {
    path: "/home/home1xbet",
    Component: Home1xbet,
  },

  {
    path: "/home/homephilosophie",
    Component: Homephilosophie,
  },

  {
    path: "/home/homechimie",
    Component: Homechimie,
  },

  {
    path: "/home/hometechnologie",
    Component: Hometechnologie,
  },

  {
    path: "/home/homefon",
    Component: Homefon,
  },

  {
    path: "/home/homeanglais",
    Component: Homeanglais,
  },

  {
    path: "/home/homeintelligenceartificielle",
    Component: Homeintelligenceartificielle,
  },

  {
    path: "/home/homeallemand",
    Component: Homeallemand,
  },

  {
    path: "/home/homebasketball",
    Component: Homebasketball,
  },

  {
    path: "/home/homebatterie",
    Component: Homebatterie,
  },

  {
    path: "/home/homebricolage",
    Component: Homebricolage,
  },

  {
    path: "/home/homechant",
    Component: Homechant,
  },

  {
    path: "/home/homechine",
    Component: Homechine,
  },

  {
    path: "/home/homeenchainement",
    Component: Homeenchainement,
  },

  {
    path: "/home/homeespagnole",
    Component: Homeespagnole,
  },

  {
    path: "/home/homefootball",
    Component: Homefootball,
  },

  {
    path: "/home/homevoleyball",
    Component: Homevoleyball,
  },

  {
    path: "/home/homefrançais",
    Component: Homefrançais,
  },

  // --------------------------------------------------------
  // GÉOGRAPHIE
  // --------------------------------------------------------

  {
    path: "/home/homegeographieafrique",
    Component: Homegeographieafrique,
  },

  {
    path: "/home/homegeographieamerique",
    Component: Homegeographieamerique,
  },

  {
    path: "/home/homegeographieasie",
    Component: Homegeographieasie,
  },

  {
    path: "/home/homegeographiebenin",
    Component: Homegeographiebenin,
  },

  {
    path: "/home/homegeographiechine",
    Component: Homegeographiechine,
  },

  {
    path: "/home/homegeographieetatsunis",
    Component: Homegeographieetatsunis,
  },

  {
    path: "/home/homegeographiefrance",
    Component: Homegeographiefrance,
  },

  {
    path: "/home/homegeographieinde",
    Component: Homegeographieinde,
  },

  {
    path: "/home/homegeographiejapon",
    Component: Homegeographiejapon,
  },

  {
    path: "/home/homegeographierussie",
    Component: Homegeographierussie,
  },

  {
    path: "/home/homegeographieurss",
    Component: Homegeographieurss,
  },

  // --------------------------------------------------------
  // SPORT
  // --------------------------------------------------------

  {
    path: "/home/homegrimper",
    Component: Homegrimper,
  },

  {
    path: "/home/homeguitare",
    Component: Homeguitare,
  },

  {
    path: "/home/homegymnastique",
    Component: Homegymnastique,
  },

  {
    path: "/home/homesautenhauteur",
    Component: Homesautenhauteur,
  },

  {
    path: "/home/homesautenlongueur",
    Component: Homesautenlongueur,
  },

  {
    path: "/home/hometriplesaut",
    Component: Hometriplesaut,
  },

  // --------------------------------------------------------
  // HISTOIRE
  // --------------------------------------------------------

  {
    path: "/home/homehistoireafrique",
    Component: Homehistoireafrique,
  },

  {
    path: "/home/homehistoireamerique",
    Component: Homehistoireamerique,
  },

  {
    path: "/home/homehistoireasie",
    Component: Homehistoireasie,
  },

  {
    path: "/home/homehistoirebenin",
    Component: Homehistoirebenin,
  },

  {
    path: "/home/homehistoirechine",
    Component: Homehistoirechine,
  },

  {
    path: "/home/homehistoireetatsunis",
    Component: Homehistoireetatsunis,
  },

  {
    path: "/home/homehistoirefrance",
    Component: Homehistoirefrance,
  },

  {
    path: "/home/homehistoireinde",
    Component: Homehistoireinde,
  },

  {
    path: "/home/homehistoirejapon",
    Component: Homehistoirejapon,
  },

  {
    path: "/home/homehistoirerussie",
    Component: Homehistoirerussie,
  },

  {
    path: "/home/homehistoireurss",
    Component: Homehistoireurss,
  },

  // --------------------------------------------------------
  // INFORMATIQUE
  // --------------------------------------------------------

  {
    path: "/home/homehtmlcss",
    Component: Homehtmlcss,
  },

  {
    path: "/home/homejavascript",
    Component: Homejavascript,
  },

  {
    path: "/home/homejeux",
    Component: Homejeux,
  },

  {
    path: "/home/homepython",
    Component: Homepython,
  },

  {
    path: "/home/homelangagec",
    Component: Homelangagec,
  },

  {
    path: "/home/homelangagecplusplus",
    Component: Homelangagecplusplus,
  },

  {
    path: "/home/homelangager",
    Component: Homelangager,
  },

  // --------------------------------------------------------
  // FINANCE
  // --------------------------------------------------------

  {
    path: "/home/homelibertefinanciere",
    Component: Homelibertefinanciere,
  },

  // --------------------------------------------------------
  // MUSIQUE / CULTURE
  // --------------------------------------------------------

  {
    path: "/home/homepiano",
    Component: Homepiano,
  },

  {
    path: "/home/homeproverbesetvertus",
    Component: Homeproverbesetvertus,
  },

  // ========================================================
  // ANCIENNES PAGES MATIÈRES
  // ========================================================

  {
    path: "/matieres/matieresdivertissement",
    Component: Matieresdivertissement,
  },

  {
    path: "/matieres/matiereseps",
    Component: Matiereseps,
  },

  {
    path: "/matieres/matieresgeographie",
    Component: Matieresgeographie,
  },

  {
    path: "/matieres/matiereshistoire",
    Component: Matiereshistoire,
  },

  {
    path: "/matieres/matieresinformatique",
    Component: Matieresinformatique,
  },

  {
    path: "/matieres/matiereslangue",
    Component: Matiereslangue,
  },

  {
    path: "/matieres/matieresmusique",
    Component: Matieresmusique,
  },

  {
    path: "/matieres/matierespct",
    Component: Matierespct,
  },

  // ========================================================
  // ADMIN
  // ========================================================

  {
    path: "/admin/dashboard",
    Component: Dashboard,
  },
];

// ==========================================================
// COMPOSANT PRINCIPAL
// ==========================================================

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">

      <Routes
        location={location}
        key={location.pathname}
      >

        {/* ==================================================
            ROUTES PUBLIQUES
            ================================================== */}

        <Route
          path="/"
          element={<Page1 />}
        />

        <Route
          path="/login"
          element={<Layout><Login /></Layout>}
        />

        <Route
          path="/inscription"
          element={<Inscription />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/activation"
          element={<Activation />}
        />

        <Route
          path="/admin/documents"
          element={<AdminDocuments />}
        />

        <Route
          path="/admin/codes-activation"
          element={<Layout><AdminActivationCodes /></Layout>}
        />

        {/* ==================================================
            ROUTES PROTÉGÉES
            ================================================== */}

        {protectedPages.map(
          ({ path, Component }) => (

            <Route
              key={path}
              path={path}
              element={
                <RequireAuth>
                  <Layout>
                    <Component />
                  </Layout>
                </RequireAuth>
              }
            />

          )
        )}





 <Route
  path="/domaines/academique"
  element={
    <RequireAuth>
      <Layout>
        <Academique />
      </Layout>
    </RequireAuth>
  }
/>




       <Route
  path="/domaines/academique/mathematiques"
  element={
    <RequireAuth>
      <Layout>
        <Mathematiques />
      </Layout>
    </RequireAuth>
  }
/>


<Route
  path="/domaines/academique/physique"
  element={
    <RequireAuth>
      <Layout>
        <Physique />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/domaines/academique/chimie"
  element={
    <RequireAuth>
      <Layout>
        <Chimie />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/domaines/academique/informatique"
  element={
    <RequireAuth>
      <Layout>
        <Informatique />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/domaines/academique/langues"
  element={
    <RequireAuth>
      <Layout>
        <Langues />
      </Layout>
    </RequireAuth>
  }
/>


<Route
  path="/domaines/academique/litterature-arts"
  element={
    <RequireAuth>
      <Layout>
        <LitteratureArts />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/domaines/academique/sciences-humaines-sociales"
  element={
    <RequireAuth>
      <Layout>
        <SciencesHumainesSociales />
      </Layout>
    </RequireAuth>
  }
/>
<Route
  path="/domaines/academique/sciences-terre"
  element={
    <RequireAuth>
      <Layout>
        <SciencesTerre />
      </Layout>
    </RequireAuth>
  }
/>
<Route
  path="/domaines/academique/sciences-vie"
  element={
    <RequireAuth>
      <Layout>
        <SciencesVie />
      </Layout>
    </RequireAuth>
  }
/>
{/* ============================================================
    AFRIQUE
============================================================ */}

<Route
  path="/domaines/afrique"
  element={
    <Layout>
      <Afrique />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/cultures-africaines"
  element={
    <Layout>
      <CulturesAfricaines />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/economie-africaine"
  element={
    <Layout>
      <EconomieAfricaine />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/education-afrique"
  element={
    <Layout>
      <EducationAfrique />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/entrepreneuriat-afrique"
  element={
    <Layout>
      <EntrepreneuriatAfrique />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/geographie-afrique"
  element={
    <Layout>
      <GeographieAfrique />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/histoire-afrique"
  element={
    <Layout>
      <HistoireAfrique />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/langues-africaines"
  element={
    <Layout>
      <LanguesAfricaines />
    </Layout>
  }
/>

<Route
  path="/domaines/afrique/sciences-technologies-afrique"
  element={
    <Layout>
      <SciencesTechnologiesAfrique />
    </Layout>
  }
/>


{/* ============================================================
    ARTS
============================================================ */}

<Route
  path="/domaines/arts"
  element={
    <Layout>
      <Arts />
    </Layout>
  }
/>

<Route
  path="/domaines/arts/arts-plastiques"
  element={
    <Layout>
      <ArtsPlastiques />
    </Layout>
  }
/>

<Route
  path="/domaines/arts/cinema"
  element={
    <Layout>
      <Cinema />
    </Layout>
  }
/>

<Route
  path="/domaines/arts/danse"
  element={
    <Layout>
      <Danse />
    </Layout>
  }
/>

<Route
  path="/domaines/arts/musique"
  element={
    <Layout>
      <Musique />
    </Layout>
  }
/>

<Route
  path="/domaines/arts/photographie"
  element={
    <Layout>
      <Photographie />
    </Layout>
  }
/>

<Route
  path="/domaines/arts/theatre"
  element={
    <Layout>
      <Theatre />
    </Layout>
  }
/>


{/* ============================================================
    AUTRES
============================================================ */}

<Route
  path="/domaines/autres"
  element={
    <Layout>
      <Autres />
    </Layout>
  }
/>

<Route
  path="/domaines/autres/competences-transversales"
  element={
    <Layout>
      <CompetencesTransversales />
    </Layout>
  }
/>

<Route
  path="/domaines/autres/culture-generale"
  element={
    <Layout>
      <CultureGenerale />
    </Layout>
  }
/>

<Route
  path="/domaines/autres/loisirs"
  element={
    <Layout>
      <Loisirs />
    </Layout>
  }
/>

<Route
  path="/domaines/autres/vie-quotidienne"
  element={
    <Layout>
      <VieQuotidienne />
    </Layout>
  }
/>


{/* ============================================================
    DÉVELOPPEMENT HUMAIN
============================================================ */}

<Route
  path="/domaines/developpement-humain"
  element={
    <Layout>
      <DeveloppementHumain />
    </Layout>
  }
/>

<Route
  path="/domaines/developpement-humain/developpement-personnel"
  element={
    <Layout>
      <DeveloppementPersonnel />
    </Layout>
  }
/>

<Route
  path="/domaines/developpement-humain/gestion-temps"
  element={
    <Layout>
      <GestionTemps />
    </Layout>
  }
/>

<Route
  path="/domaines/developpement-humain/leadership"
  element={
    <Layout>
      <Leadership />
    </Layout>
  }
/>

<Route
  path="/domaines/developpement-humain/pensee-critique"
  element={
    <Layout>
      <PenseeCritique />
    </Layout>
  }
/>

<Route
  path="/domaines/developpement-humain/prise-decision"
  element={
    <Layout>
      <PriseDecision />
    </Layout>
  }
/>

<Route
  path="/domaines/developpement-humain/relations-humaines"
  element={
    <Layout>
      <RelationsHumaines />
    </Layout>
  }
/>


{/* ============================================================
    ENVIRONNEMENT
============================================================ */}

<Route
  path="/domaines/environnement"
  element={
    <Layout>
      <Environnement />
    </Layout>
  }
/>

<Route
  path="/domaines/environnement/agriculture-durable"
  element={
    <Layout>
      <AgricultureDurable />
    </Layout>
  }
/>

<Route
  path="/domaines/environnement/biodiversite"
  element={
    <Layout>
      <Biodiversite />
    </Layout>
  }
/>

<Route
  path="/domaines/environnement/climat"
  element={
    <Layout>
      <Climat />
    </Layout>
  }
/>

<Route
  path="/domaines/environnement/eau"
  element={
    <Layout>
      <Eau />
    </Layout>
  }
/>

<Route
  path="/domaines/environnement/ecologie"
  element={
    <Layout>
      <Ecologie />
    </Layout>
  }
/>

<Route
  path="/domaines/environnement/gestion-dechets"
  element={
    <Layout>
      <GestionDechets />
    </Layout>
  }
/>


{/* ============================================================
    FINANCE
============================================================ */}

<Route
  path="/domaines/finance"
  element={
    <Layout>
      <Finance />
    </Layout>
  }
/>

<Route
  path="/domaines/finance/banque"
  element={
    <Layout>
      <Banque />
    </Layout>
  }
/>

<Route
  path="/domaines/finance/comptabilite"
  element={
    <Layout>
      <Comptabilite />
    </Layout>
  }
/>

<Route
  path="/domaines/finance/economie"
  element={
    <Layout>
      <Economie />
    </Layout>
  }
/>

<Route
  path="/domaines/finance/finance-personnelle"
  element={
    <Layout>
      <FinancePersonnelle />
    </Layout>
  }
/>

<Route
  path="/domaines/finance/fiscalite"
  element={
    <Layout>
      <Fiscalite />
    </Layout>
  }
/>

<Route
  path="/domaines/finance/investissement"
  element={
    <Layout>
      <Investissement />
    </Layout>
  }
/>


{/* ============================================================
    JEUX
============================================================ */}

<Route
  path="/domaines/jeux"
  element={
    <Layout>
      <Jeux />
    </Layout>
  }
/>

<Route
  path="/domaines/jeux/echecs"
  element={
    <Layout>
      <Echecs />
    </Layout>
  }
/>

<Route
  path="/domaines/jeux/game-design"
  element={
    <Layout>
      <GameDesign />
    </Layout>
  }
/>

<Route
  path="/domaines/jeux/jeux-mathematiques"
  element={
    <Layout>
      <JeuxMathematiques />
    </Layout>
  }
/>

<Route
  path="/domaines/jeux/jeux-societe"
  element={
    <Layout>
      <JeuxSociete />
    </Layout>
  }
/>

<Route
  path="/domaines/jeux/jeux-strategie"
  element={
    <Layout>
      <JeuxStrategie />
    </Layout>
  }
/>

<Route
  path="/domaines/jeux/puzzles"
  element={
    <Layout>
      <Puzzles />
    </Layout>
  }
/>


{/* ============================================================
    MÉTIERS
============================================================ */}

<Route
  path="/domaines/metiers"
  element={
    <Layout>
      <Metiers />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/agriculture"
  element={
    <Layout>
      <Agriculture />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/construction"
  element={
    <Layout>
      <Construction />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/couture"
  element={
    <Layout>
      <Couture />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/cuisine"
  element={
    <Layout>
      <Cuisine />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/electricite"
  element={
    <Layout>
      <Electricite />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/mecanique"
  element={
    <Layout>
      <Mecanique />
    </Layout>
  }
/>

<Route
  path="/domaines/metiers/menuiserie"
  element={
    <Layout>
      <Menuiserie />
    </Layout>
  }
/>


{/* ============================================================
    PÉDAGOGIE
============================================================ */}

<Route
  path="/domaines/pedagogie"
  element={
    <Layout>
      <Pedagogie />
    </Layout>
  }
/>

<Route
  path="/domaines/pedagogie/didactique"
  element={
    <Layout>
      <Didactique />
    </Layout>
  }
/>

<Route
  path="/domaines/pedagogie/evaluation"
  element={
    <Layout>
      <EvaluationPedagogique />
    </Layout>
  }
/>

<Route
  path="/domaines/pedagogie/ingenierie-pedagogique"
  element={
    <Layout>
      <IngenieriePedagogique />
    </Layout>
  }
/>

<Route
  path="/domaines/pedagogie/pedagogie-generale"
  element={
    <Layout>
      <PedagogieGenerale />
    </Layout>
  }
/>

<Route
  path="/domaines/pedagogie/psychologie-education"
  element={
    <Layout>
      <PsychologieEducation />
    </Layout>
  }
/>

<Route
  path="/domaines/pedagogie/technologies-educatives"
  element={
    <Layout>
      <TechnologiesEducatives />
    </Layout>
  }
/>


{/* ============================================================
    PROFESSIONNELLE
============================================================ */}

<Route
  path="/domaines/professionnelle"
  element={
    <Layout>
      <Professionnelle />
    </Layout>
  }
/>

<Route
  path="/domaines/professionnelle/commerce"
  element={
    <Layout>
      <Commerce />
    </Layout>
  }
/>

<Route
  path="/domaines/professionnelle/communication"
  element={
    <Layout>
      <Communication />
    </Layout>
  }
/>

<Route
  path="/domaines/professionnelle/entrepreneuriat"
  element={
    <Layout>
      <Entrepreneuriat />
    </Layout>
  }
/>

<Route
  path="/domaines/professionnelle/gestion"
  element={
    <Layout>
      <Gestion />
    </Layout>
  }
/>

<Route
  path="/domaines/professionnelle/management"
  element={
    <Layout>
      <Management />
    </Layout>
  }
/>

<Route
  path="/domaines/professionnelle/marketing"
  element={
    <Layout>
      <Marketing />
    </Layout>
  }
/>


{/* ============================================================
    RECHERCHE
============================================================ */}

<Route
  path="/domaines/recherche"
  element={
    <Layout>
      <Recherche />
    </Layout>
  }
/>

<Route
  path="/domaines/recherche/analyse-donnees"
  element={
    <Layout>
      <AnalyseDonnees />
    </Layout>
  }
/>

<Route
  path="/domaines/recherche/bibliographie"
  element={
    <Layout>
      <Bibliographie />
    </Layout>
  }
/>

<Route
  path="/domaines/recherche/communication-scientifique"
  element={
    <Layout>
      <CommunicationScientifique />
    </Layout>
  }
/>

<Route
  path="/domaines/recherche/methodologie"
  element={
    <Layout>
      <Methodologie />
    </Layout>
  }
/>

<Route
  path="/domaines/recherche/redaction-scientifique"
  element={
    <Layout>
      <RedactionScientifique />
    </Layout>
  }
/>

<Route
  path="/domaines/recherche/statistiques"
  element={
    <Layout>
      <StatistiquesRecherche />
    </Layout>
  }
/>


{/* ============================================================
    SANTÉ
============================================================ */}

<Route
  path="/domaines/sante"
  element={
    <Layout>
      <Sante />
    </Layout>
  }
/>

<Route
  path="/domaines/sante/hygiene"
  element={
    <Layout>
      <Hygiene />
    </Layout>
  }
/>

<Route
  path="/domaines/sante/medecine"
  element={
    <Layout>
      <Medecine />
    </Layout>
  }
/>

<Route
  path="/domaines/sante/nutrition"
  element={
    <Layout>
      <Nutrition />
    </Layout>
  }
/>

<Route
  path="/domaines/sante/pharmacie"
  element={
    <Layout>
      <Pharmacie />
    </Layout>
  }
/>

<Route
  path="/domaines/sante/sante-publique"
  element={
    <Layout>
      <SantePublique />
    </Layout>
  }
/>

<Route
  path="/domaines/sante/soins-infirmiers"
  element={
    <Layout>
      <SoinsInfirmiers />
    </Layout>
  }
/>


{/* ============================================================
    SCIENCES & INNOVATION
============================================================ */}

<Route
  path="/domaines/sciences-innovation"
  element={
    <Layout>
      <SciencesInnovation />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/astronomie"
  element={
    <Layout>
      <Astronomie />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/biotechnologies"
  element={
    <Layout>
      <Biotechnologies />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/materiaux"
  element={
    <Layout>
      <Materiaux />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/nanotechnologies"
  element={
    <Layout>
      <Nanotechnologies />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/sciences-chimiques"
  element={
    <Layout>
      <SciencesChimiques />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/sciences-physiques"
  element={
    <Layout>
      <SciencesPhysiques />
    </Layout>
  }
/>

<Route
  path="/domaines/sciences-innovation/sciences-spatiales"
  element={
    <Layout>
      <SciencesSpatiales />
    </Layout>
  }
/>


{/* ============================================================
    SOCIÉTÉ
============================================================ */}

<Route
  path="/domaines/societe"
  element={
    <Layout>
      <Societe />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/anthropologie"
  element={
    <Layout>
      <Anthropologie />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/citoyennete"
  element={
    <Layout>
      <Citoyennete />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/droit"
  element={
    <Layout>
      <Droit />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/geographie"
  element={
    <Layout>
      <Geographie />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/histoire"
  element={
    <Layout>
      <Histoire />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/institutions"
  element={
    <Layout>
      <Institutions />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/medias"
  element={
    <Layout>
      <Medias />
    </Layout>
  }
/>

<Route
  path="/domaines/societe/sociologie"
  element={
    <Layout>
      <Sociologie />
    </Layout>
  }
/>


{/* ============================================================
    TECHNOLOGIES
============================================================ */}

<Route
  path="/domaines/technologies"
  element={
    <Layout>
      <Technologies />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/cybersecurite"
  element={
    <Layout>
      <Cybersecurite />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/data-science"
  element={
    <Layout>
      <DataScience />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/design-numerique"
  element={
    <Layout>
      <DesignNumerique />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/electronique"
  element={
    <Layout>
      <Electronique />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/intelligence-artificielle"
  element={
    <Layout>
      <IntelligenceArtificielle />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/programmation"
  element={
    <Layout>
      <Programmation />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/reseaux"
  element={
    <Layout>
      <Reseaux />
    </Layout>
  }
/>

<Route
  path="/domaines/technologies/robotique"
  element={
    <Layout>
      <Robotique />
    </Layout>
  }
/>















        {/* ==================================================
            CODE — ÉVALUATION UNIQUE
            ================================================== */}

        <Route
          path="/evaluation/:domaine/:sousDomaine/:apprentissage"
          element={
            <RequireAuth>
              <Layout>
                <Evaluation />
              </Layout>
            </RequireAuth>
          }
        />

        {/* ==================================================
            ANCIEN SYSTÈME DE TESTS MATHÉMATIQUES
            ================================================== */}

        <Route
          path="/maths/test/questions/:niveau/:serie"
          element={
            <RequireAuth>
              <Layout>
                <Questions />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/maths/test/resultats/:niveau/:serie"
          element={
            <RequireAuth>
              <Layout>
                <Resultats />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/maths/test/remediation/:niveau/:serie"
          element={
            <RequireAuth>
              <Layout>
                <Remediation />
              </Layout>
            </RequireAuth>
          }
        />

        <Route
          path="/maths/test/remediationvideo/:niveau/:serie?"
          element={
            <RequireAuth>
              <Layout>
                <RemediationVideo />
              </Layout>
            </RequireAuth>
          }
        />

        {/* ==================================================
            ADMIN — PARRAIN
            ================================================== */}

        <Route
          path="/admin/parrain/:email"
          element={
            <RequireAuth>
              <Layout>
                <ParrainDetails />
              </Layout>
            </RequireAuth>
          }
        />

        {/* ==================================================
            ADMIN — HISTORIQUE
            ================================================== */}

        <Route
          path="/admin/historique-connections"
          element={
            <RequireAuth>
              <Layout>
                <HistoriqueConnections />
              </Layout>
            </RequireAuth>
          }
        />




{/* ==================================================
    QUESTIONS — UTILISATEUR
    ================================================== */}

<Route
  path="/questions"
  element={
    <RequireAuth>
      <Layout>
        <MesQuestions />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/questions/nouvelle"
  element={
    <RequireAuth>
      <Layout>
        <NouvelleQuestion />
      </Layout>
    </RequireAuth>
  }
/>



<Route
  path="/admin/conversations-enseignants"
  element={
    <RequireAuth>
      <Layout>
        <ConversationsEnseignantsAdmin />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/admin/conversations-enseignants/:questionId"
  element={
    <RequireAuth>
      <Layout>
        <ConversationAdmin />
      </Layout>
    </RequireAuth>
  }
/>



<Route
  path="/questions/:questionId"
  element={
    <RequireAuth>
      <Layout>
        <Conversation />
      </Layout>
    </RequireAuth>
  }
/>

{/* ==================================================
    PROFIL — ENSEIGNANT
    ================================================== */}

<Route
  path="/enseignant/profil"
  element={
    <RequireAuth>
      <Layout>
        <ProfilEnseignant />
      </Layout>
    </RequireAuth>
  }
/>


{/* ==================================================
    ESPACE PRINCIPAL — ENSEIGNANT
    ================================================== */}

<Route
  path="/enseignant"
  element={
    <RequireAuth>
      <Layout>
        <Enseignant />
      </Layout>
    </RequireAuth>
  }
/>



{/* ==================================================
    QUESTIONS — ENSEIGNANT
    ================================================== */}

<Route
  path="/enseignant/questions"
  element={
    <RequireAuth>
      <Layout>
        <QuestionsEnseignant />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/enseignant/questions/:questionId"
  element={
    <RequireAuth>
      <Layout>
        <ConversationEnseignant />
      </Layout>
    </RequireAuth>
  }
/>


{/* ==================================================
    ADMIN — QUESTIONS
    ================================================== */}

<Route
  path="/admin/questions"
  element={
    <RequireAuth>
      <Layout>
        <QuestionsAdmin />
      </Layout>
    </RequireAuth>
  }
/>

<Route
  path="/admin/questions/:questionId"
  element={
    <RequireAuth>
      <Layout>
        <ConversationAdmin />
      </Layout>
    </RequireAuth>
  }
/>


{/* ==================================================
    ADMIN — GESTION DES ENSEIGNANTS
    ================================================== */}

<Route
  path="/admin/enseignants"
  element={
    <RequireAuth>
      <Layout>
        <GestionEnseignants />
      </Layout>
    </RequireAuth>
  }
/>





        {/* ==================================================
            VIDÉOS
            ================================================== */}

        <Route
          path="/video/:matiere"
          element={<VideoPlayer />}
        />

        <Route
          path="/video/:matiere/:videoId"
          element={<VideoPlayer />}
        />

        {/* ==================================================
            REMÉDIATION VIDÉO
            ================================================== */}

        <Route
          path="/remediationvideo/:matiere/:niveau/:serie?"
          element={
            <RemediationVideo />
          }
        />

        {/* ==================================================
            LISTE DES INSCRITS
            ================================================== */}

        <Route
          path="/liste-inscrits"
          element={
            <ListeInscrits />
          }
        />

      </Routes>

    </AnimatePresence>
  );
};

export default AnimatedRoutes;