// 📁 src/AnimatedRoutes.tsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import RequireAuth from "@/components/RequireAuth";

// Pages publiques
import Page1 from "./pages/Page1";
import Page2 from "./pages/Page2";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import Etudiant from "./pages/Etudiant";
import RemediationVideo from "./pages/Maths/Test/RemediationVideo/RemediationVideo";
import VideoPlayer from "./pages/VideoPlayer";
import ListeInscrits from "./pages/ListeInscrits";

// Pages protégées
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
import Matieresdivertissement from "./pages/Matieres/Matieresdivertissement";
import Matiereseps from "./pages/Matieres/Matiereseps";
import Matieresgeographie from "./pages/Matieres/Matieresgeographie";
import Matiereshistoire from "./pages/Matieres/Matiereshistoire";
import Matieresinformatique from "./pages/Matieres/Matieresinformatique";
import Matiereslangue from "./pages/Matieres/Matiereslangue";
import Matieresmusique from "./pages/Matieres/Matieresmusique";
import Matierespct from "./pages/Matieres/Matierespct";

// Tests
import Questions from "./pages/Maths/Test/Questions/Questions";
import Resultats from "./pages/Maths/Test/Resultats/Resultats";
import Remediation from "./pages/Maths/Test/Remediation/Remediation";

import Homefanfare from "./pages/Home/Homefanfare";
import Hometrompette from "./pages/Home/Hometrompette";
import Hometrading from "./pages/Home/Hometrading";
import Home1xbet from "./pages/Home/Home1xbet";

// 🔹 Définition unique des pages protégées
const protectedPages = [
  { path: "/page2", Component: Page2 },
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
  { path: "/matiere", Component: Matiere },
  { path: "/etudiant", Component: Etudiant },
  { path: "/home/homemaths", Component: Homemaths },
  { path: "/home/homefanfare", Component: Homefanfare },
  { path: "/home/hometrompette", Component: Hometrompette },
  { path: "/home/homephysique", Component: Homephysique },
  { path: "/home/homesvt", Component: Homesvt },
  { path: "/home/hometrading", Component: Hometrading },
  { path: "/home/home1xbet", Component: Home1xbet },
  { path: "/home/homephilosophie", Component: Homephilosophie },
  { path: "/home/homechimie", Component: Homechimie },
  { path: "/home/hometechnologie", Component: Hometechnologie },
  { path: "/home/homefon", Component: Homefon},
  { path: "/home/homeanglais", Component: Homeanglais },
  { path: "/home/homeintelligenceartificielle", Component: Homeintelligenceartificielle },
  { path: "/home/homeallemand", Component: Homeallemand },
  { path: "/home/homebasketball", Component: Homebasketball},
  { path: "/home/homebatterie", Component: Homebatterie},
  { path: "/home/homebricolage", Component: Homebricolage},
  { path: "/home/homechant", Component: Homechant},
  { path: "/home/homechine", Component: Homechine},
  { path: "/home/homeenchainement", Component: Homeenchainement},
  { path: "/home/homeespagnole", Component: Homeespagnole},
  { path: "/home/homefootball", Component: Homefootball},
  { path: "/home/homevoleyball", Component: Homevoleyball},
  { path: "/home/homefrançais", Component: Homefrançais},
  { path: "/home/homegeographieafrique", Component: Homegeographieafrique},
  { path: "/home/homegeographieamerique", Component: Homegeographieamerique},
  { path: "/home/homegeographieasie", Component: Homegeographieasie},
  { path: "/home/homegeographiebenin", Component: Homegeographiebenin},
  { path: "/home/homegeographiechine", Component: Homegeographiechine},
  { path: "/home/homegeographieetatsunis", Component: Homegeographieetatsunis},
  { path: "/home/homegeographiefrance", Component: Homegeographiefrance},
  { path: "/home/homegeographieinde", Component: Homegeographieinde},
  { path: "/home/homegeographiejapon", Component: Homegeographiejapon},
  { path: "/home/homegeographierussie", Component: Homegeographierussie},
  { path: "/home/homegeographieurss", Component: Homegeographieurss},
  { path: "/home/homegrimper", Component: Homegrimper},
  { path: "/home/homeguitare", Component: Homeguitare},
  { path: "/home/homegymnastique", Component: Homegymnastique},
  { path: "/home/homehistoireafrique", Component: Homehistoireafrique},
  { path: "/home/homehistoireamerique", Component: Homehistoireamerique},
  { path: "/home/homehistoireasie", Component: Homehistoireasie},
  { path: "/home/homehistoirebenin", Component: Homehistoirebenin},
  { path: "/home/homehistoirechine", Component: Homehistoirechine},
  { path: "/home/homehistoireetatsunis", Component: Homehistoireetatsunis},
  { path: "/home/homehistoirefrance", Component: Homehistoirefrance},
  { path: "/home/homehistoireinde", Component: Homehistoireinde},
  { path: "/home/homehistoirejapon", Component: Homehistoirejapon},
  { path: "/home/homehistoirerussie", Component: Homehistoirerussie},
  { path: "/home/homehistoireurss", Component: Homehistoireurss},
  { path: "/home/homehtmlcss", Component: Homehtmlcss},
  { path: "/home/homejavascript", Component: Homejavascript},
  { path: "/home/homejeux", Component: Homejeux},
  { path: "/home/homepython", Component: Homepython},
  { path: "/home/homelangagec", Component: Homelangagec},
  { path: "/home/homelangagecplusplus", Component: Homelangagecplusplus},
  { path: "/home/homelangager", Component: Homelangager},
  { path: "/home/homelibertefinanciere", Component: Homelibertefinanciere},
  { path: "/home/homepiano", Component: Homepiano},
  { path: "/home/homeproverbesetvertus", Component: Homeproverbesetvertus},
  { path: "/home/homesautenhauteur", Component: Homesautenhauteur},
  { path: "/home/homesautenlongueur", Component: Homesautenlongueur},
  { path: "/home/hometriplesaut", Component: Hometriplesaut},
  { path: "/matieres/matieresdivertissement", Component: Matieresdivertissement},
  { path: "/matieres/matiereseps", Component: Matiereseps},
  { path: "/matieres/matieresgeographie", Component: Matieresgeographie},
  { path: "/matieres/matiereshistoire", Component: Matiereshistoire},
  { path: "/matieres/matieresinformatique", Component: Matieresinformatique},
  { path: "/matieres/matiereslangue", Component: Matiereslangue},
  { path: "/matieres/matieresmusique", Component: Matieresmusique},
  { path: "/matieres/matierespct", Component: Matierespct},
];

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Routes publiques */}
        <Route path="/" element={<Page1 />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Inscription />} />
        

        {/* Routes protégées */}
        {protectedPages.map(({ path, Component }) => (
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
        ))}

        {/* Tests */}
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



        <Route path="/video/:matiere" element={<VideoPlayer />} />
<Route path="/video/:matiere/:videoId" element={<VideoPlayer />} />



// Exemple dans ton Router
<Route 
  path="/remediationvideo/:matiere/:niveau/:serie?" 
  element={<RemediationVideo />}
/>

<Route path="/liste-inscrits" element={<ListeInscrits />} />


      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
