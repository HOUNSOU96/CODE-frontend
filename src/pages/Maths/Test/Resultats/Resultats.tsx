import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/utils/axios";
import { trierNotionsNonAcquises } from "../../../../data/utils/notions";
import { useAuth } from "../../../../hooks/useAuth";
import DarkModeToggle from "@/components/DarkModeToggle";
import AudioManager from "@/components/AudioManager";
import { User } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";

const mots = ["BIENVENU", "SUR", "CODE"];
const couleurs = ["#00FF00", "#FFFF00", "#FF0000"];

const mentionColors: Record<string, string> = {
  "Très Bien": "bg-emerald-500 text-white shadow-md",
  "Bien": "bg-yellow-400 text-black shadow-md",
  "Assez Bien": "bg-yellow-300 text-black shadow-md",
  "Passable": "bg-orange-400 text-white shadow-md",
  "Insuffisant": "bg-red-600 text-white shadow-md",
};

type ResultatType = {
  note: number;
  mention: string;
  notionsNonAcquises: string[];
  [key: string]: any;
};

const Resultats: React.FC = () => {
  const location = useLocation();
  const { niveau, serie } = useParams<{ niveau: string; serie: string }>();
  const navigate = useNavigate();
  const resultRef = useRef<HTMLDivElement>(null);
  const sentPDF = useRef(false);
  const { user: apprenant, token, loading: loadingAuth } = useAuth();

  // 🧠 Initialisation robuste
  const [resultats, setResultats] = useState<ResultatType | null>(
    location.state?.resultats ?? null
  );
  const [loadingResult, setLoadingResult] = useState(!resultats);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [motActuel, setMotActuel] = useState(0);
  const [orActif, setOrActif] = useState(false);

  const note = resultats?.note ?? 0;
  const mention = resultats?.mention ?? "";
  // Vérifier si le niveau correspond au collège (6e à 3e)
const niveauxCollege = ["6e", "5e", "4e", "3e"];

const niveauComplet =
  niveau && niveauxCollege.includes(niveau.toLowerCase())
    ? niveau.toUpperCase()
    : `${niveau ?? ""} ${serie ?? ""}`.toUpperCase();

  const notionsNonAcquises = Array.isArray(resultats?.notionsNonAcquises)
    ? resultats.notionsNonAcquises
    : [];
  const notionsTriees = trierNotionsNonAcquises(notionsNonAcquises, niveauComplet);
  const mentionStyle = mentionColors[mention] || "bg-gray-500 text-white shadow-md";
  const dateEmission = new Date().toLocaleDateString("fr-FR");

  // 🛠️ Debug
  useEffect(() => {
    console.log("location.state =", location.state);
    console.log("location.state.resultats =", location.state?.resultats);
  }, [location.state]);

  // 📦 Si résultat pas dans state, charger via API
  useEffect(() => {
    if (!resultats && token && niveau) {
      setLoadingResult(true);
      api
        .get("/api/resultats/dernier", {
          params: { niveau, serie },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setResultats(res.data);
          setError(null);
        })
        .catch(() => {
          setError("Erreur lors du chargement des résultats.");
        })
        .finally(() => {
          setLoadingResult(false);
        });
    }
  }, [resultats, token, niveau, serie]);

  useEffect(() => {
    const motTimer = setInterval(() => {
      setMotActuel((prev) => {
        if (prev + 1 === mots.length) {
          setTimeout(() => setOrActif(true), 1000);
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(motTimer);
  }, []);

  useEffect(() => {
    const sendPDF = async () => {
      if (sentPDF.current || !token || !apprenant?.email || !resultRef.current) return;

      await new Promise((resolve) => setTimeout(resolve, 1000));
      sentPDF.current = true;
      setSending(true);

      try {
        const canvas = await html2canvas(resultRef.current, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = 0;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const pdfBlob = pdf.output("blob");

        const formData = new FormData();
        formData.append("file", pdfBlob, `Resultat_${niveauComplet}.pdf`);
        formData.append("niveau", niveauComplet);
        formData.append("apprenant", JSON.stringify({
          email: apprenant.email,
          prenom: apprenant.prenom,
          nom: apprenant.nom,
        }));

        await api.post("/api/send-result-pdf", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        setSuccess("✅ PDF envoyé avec succès !");
      } catch (error) {
        console.error("❌ Erreur d'envoi PDF :", error);
        setSuccess("❌ Échec de l'envoi du PDF.");
      } finally {
        setSending(false);
      }
    };

    sendPDF();
  }, [token, apprenant, niveauComplet]);

  const handleRemediationStart = () => {
    if (!niveau || !serie) return;
    navigate(`/maths/test/remediation/${niveau.toLowerCase()}/${serie.toLowerCase()}`, {
     replace: true,
      state: {
        notions_non_acquises: notionsNonAcquises,
        niveauActuel: niveau,
        serieActuelle: serie,
      },
    });
  };

  const handleDownloadPDF = async () => {
    if (!resultRef.current) return;

    const canvas = await html2canvas(resultRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let heightLeft = imgHeight;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Resultat_${niveauComplet}.pdf`);
  };

  if (loadingAuth || loadingResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
        Chargement des résultats...
      </div>
    );
  }

  if (error || !resultats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-300 px-4 text-center">
        <p className="mb-6 text-2xl font-semibold">{error ?? "Résultats soumis mais données manquantes pour l'affichage."}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <DarkModeToggle />
      <AudioManager />

      <div className="fixed inset-0 z-0 overflow-hidden">
        {mots.slice(0, motActuel).map((mot, i) => (
          <motion.span
            key={i}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 text-6xl font-bold"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ color: orActif ? "gold" : couleurs[i] }}
          >
            {mot}
          </motion.span>
        ))}
      </div>

      <motion.div
        ref={resultRef}
        className="relative max-w-3xl mx-auto my-16 bg-white rounded-3xl shadow-2xl p-10 space-y-8 z-10 text-black"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold text-center text-blue-700">
          EVALUATION DIAGNOSTIQUE : {niveauComplet}
        </h1>

        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-3 text-xl font-semibold text-gray-800">
            <User className="w-6 h-6 text-blue-600" />
            {apprenant?.prenom} {apprenant?.nom}
          </div>
          <p className="text-sm text-gray-600">📧 {apprenant?.email}</p>
          <p className="text-sm text-gray-600">🗓️ Date: {dateEmission}</p>
          <p className="text-sm font-semibold text-blue-700 mt-2">CODE</p>
        </div>

        <div className="text-center space-y-3">
          <p className="text-3xl font-bold text-green-700">Note : {note}/20</p>
          <p className={`inline-block px-6 py-2 rounded-full text-xl font-semibold ${mentionStyle}`}>
            Mention : {mention}
          </p>
         
        </div>

        <section className="bg-gray-50 p-6 rounded-xl shadow-inner">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b border-gray-300 pb-2">
            Notions à réviser :
          </h2>
          {notionsTriees.length === 0 ? (
            <p className="text-green-600 text-center font-semibold text-lg">
              Tu as maîtrisé toutes les notions de prérequis ! 🎉
            </p>
          ) : (
            <ul className="list-disc list-inside text-gray-800 text-base">
              {notionsTriees.map((notion, index) => (
                <li key={index} className="mb-1">{notion}</li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          
            <button
              onClick={handleRemediationStart}
              className="bg-green-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition"
            >
              📚 Continuer
            </button>
          

          <button
            onClick={handleDownloadPDF}
            className="bg-blue-700 hover:bg-green-800 text-white px-6 py-3 rounded-full font-semibold shadow-md transition"
          >
            📄 Télécharger le PDF
          </button>
        </div>

        <div className="mt-10 text-center border-t pt-6 border-gray-300">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Retrouve-nous en ligne</h2>
          <p className="text-sm text-gray-600 mb-2">Scanne le QR code ci-dessous pour visiter CODE</p>
          <div className="flex justify-center">
            <div className="flex justify-center">
               <QRCode value="https://code-education.com" size={128} />
            </div>

          </div>
          <p className="text-gray-500 text-xs mt-2">code.com</p>
        </div>

        {sending && (
          <p className="text-center mt-4 text-lg font-medium text-blue-600">Envoi du PDF...</p>
        )}

        {success && (
          <p className="text-center mt-4 text-lg font-semibold text-emerald-600">{success}</p>
        )}
      </motion.div>
    </div>
  );
};

export default Resultats;