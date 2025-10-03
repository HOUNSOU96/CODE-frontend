import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import { useAuth } from "../hooks/useAuth";



type FormulaireInscription = {
  nom: string;
  prenom: string;
  sexe: string;
  dateNaissance: Date | null;
  lieuNaissance: string;
  nationalite: string;
  paysResidence: string;
  codePays: string;
  numero: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const codesPays = ['+229', '+225', '+221', '+33', '+234', '+1', '+44', '+237'];

// Playlist identique à Accueil.tsx
const videoPlaylist = [
  "/videos/pre.mp4",
  //"/videos/video3.mp4",
  //"/videos/intro3.mp4",
];

const Inscription: React.FC = () => {
  const navigate = useNavigate();
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [fadeVideo1, setFadeVideo1] = useState(true);
  const [videoFinished, setVideoFinished] = useState(false);
  const [skipTimer, setSkipTimer] = useState(5);
  const [soundUnlocked, setSoundUnlocked] = useState(true);
  const authLoading = false;
  

  const [formData, setFormData] = useState<FormulaireInscription>({
    nom: '', prenom: '', sexe: '', dateNaissance: null, lieuNaissance: '', nationalite: '', paysResidence: '',
    codePays: '+229', numero: '', email: '', password: '', confirmPassword: '',
  });
  

  const [erreurs, setErreurs] = useState<Partial<Record<keyof FormulaireInscription, string>>>({});
  const [loadingForm, setLoadingForm] = useState(false);
  const [messageServeur, setMessageServeur] = useState<string | string[]>('');
  const [afficherPassword, setAfficherPassword] = useState(false);
  const [afficherConfirmPassword, setAfficherConfirmPassword] = useState(false);
  const [infoMotDePasse, setInfoMotDePasse] = useState('');

  // Lecture initiale de la vidéo
  useEffect(() => {
    const currentRef = fadeVideo1 ? videoRef1.current : videoRef2.current;
    if (currentRef) {
      currentRef.src = videoPlaylist[currentVideoIndex];
      currentRef.currentTime = 0;
      currentRef.muted = !soundUnlocked;
      currentRef.volume = 1;
      currentRef.play().catch(() => {});
    }
  }, [currentVideoIndex, fadeVideo1, soundUnlocked]);

  // Compteur skip
  useEffect(() => {
    if (videoFinished) return;
    const interval = setInterval(() => {
      setSkipTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [videoFinished]);

  const handleVideoEnd = () => goNextVideo();
  const handleSkip = () => { if (skipTimer === 0) goNextVideo(); };

  const goNextVideo = () => {
    if (currentVideoIndex >= videoPlaylist.length - 1) { setVideoFinished(true); return; }

    const nextIndex = currentVideoIndex + 1;
    const fadeOut = fadeVideo1 ? videoRef1.current : videoRef2.current;
    const fadeIn = fadeVideo1 ? videoRef2.current : videoRef1.current;

    if (fadeOut && fadeIn) {
      fadeIn.src = videoPlaylist[nextIndex];
      fadeIn.currentTime = 0;
      fadeIn.volume = 0;
      fadeIn.muted = !soundUnlocked;
      fadeIn.play().catch(() => {});

      let progress = 0;
      const steps = 20;
      const interval = setInterval(() => {
        progress++;
        const ratio = progress / steps;
        fadeOut.volume = 1 - ratio;
        fadeIn.volume = ratio;
        fadeOut.style.opacity = `${1 - ratio}`;
        fadeIn.style.opacity = `${ratio}`;
        if (progress >= steps) {
          clearInterval(interval);
          fadeOut.pause();
          fadeOut.volume = 1;
          fadeIn.volume = 1;
          setCurrentVideoIndex(nextIndex);
          setFadeVideo1(!fadeVideo1);
          setSkipTimer(5);
        }
      }, 35);
    }
  };

  const enableSound = async () => {
    const currentRef = fadeVideo1 ? videoRef1.current : videoRef2.current;
    if (currentRef) { currentRef.muted = false; currentRef.volume = 1; try { await currentRef.play(); setSoundUnlocked(true); } catch {} }
  };

  if (authLoading) return <div>Chargement...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErreurs({ ...erreurs, [e.target.name]: '' });
    setMessageServeur('');
  };

  const handleFocusPassword = () => {
    setInfoMotDePasse("🔐 Le mot de passe doit contenir au moins 6 caractères. N'oublie pas de le noter car tu ne pourras pas le récupérer.");
  };
  const handleBlurPassword = () => setInfoMotDePasse('');

  const validerNumero = (num: string) => /^[0-9]{6,15}$/.test(num);
  const validerEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erreursTemp: Partial<Record<keyof FormulaireInscription, string>> = {};
    if (!formData.nom.trim()) erreursTemp.nom = 'Nom requis.';
    if (!formData.prenom.trim()) erreursTemp.prenom = 'Prénom requis.';
    if (!formData.sexe.trim()) erreursTemp.sexe = 'Sexe requis.';
    if (!formData.dateNaissance) erreursTemp.dateNaissance = 'Date requise.';
    if (!formData.lieuNaissance.trim()) erreursTemp.lieuNaissance = 'Lieu requis.';
    if (!formData.nationalite.trim()) erreursTemp.nationalite = 'Nationalité requise.';
    if (!formData.paysResidence.trim()) erreursTemp.paysResidence = 'Pays requis.';
    if (!formData.numero.trim()) erreursTemp.numero = 'Numéro requis.';
    else if (!validerNumero(formData.numero)) erreursTemp.numero = 'Entre 6 et 15 chiffres.';
    if (!formData.email.trim()) erreursTemp.email = 'Email requis.';
    else if (!validerEmail(formData.email)) erreursTemp.email = 'Email invalide.';
    if (!formData.password || formData.password.length < 6) erreursTemp.password = 'Mot de passe ≥ 6 caractères.';
    if (formData.password !== formData.confirmPassword) erreursTemp.confirmPassword = 'Les mots de passe ne correspondent pas.';
    setErreurs(erreursTemp);
    if (Object.keys(erreursTemp).length > 0) return;

    setLoadingForm(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          sexe: formData.sexe,
          date_naissance: formData.dateNaissance?.toISOString().slice(0,10),
          lieu_naissance: formData.lieuNaissance,
          nationalite: formData.nationalite,
          pays_residence: formData.paysResidence,
          telephone: formData.codePays + formData.numero,
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) setMessageServeur(data.detail || "Erreur lors de l’inscription.");
      else {
        setMessageServeur("✅ Demande envoyée ! Patientez pendant que les administrateurs de CODE traitent votre demande ! Redirection...");
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch { setMessageServeur("Erreur réseau, réessaie plus tard."); } 
    finally { setLoadingForm(false); }
  };

  const champ = (label: string, name: keyof FormulaireInscription, type: string = 'text', required = true) => {
    if (name === 'password' || name === 'confirmPassword') {
      const isPassword = name === 'password';
      const show = isPassword ? afficherPassword : afficherConfirmPassword;
      const toggle = isPassword ? setAfficherPassword : setAfficherConfirmPassword;
       return (
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-white">
            {label}{required && <span className="text-red-600"> *</span>}
          </label>
          <div className="relative mt-1">
            <input
              type={show ? 'text' : 'password'}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onFocus={handleFocusPassword}
              onBlur={handleBlurPassword}
              className={`w-full p-2 pr-10 rounded-xl border transition focus:ring-2 focus:outline-none ${erreurs[name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder={label}
            />
            <button
              type="button"
              onClick={() => toggle(prev => !prev)}
              className="absolute right-3 top-2 text-sm text-blue-600 focus:outline-none"
            >
              {show ? 'Masquer' : 'Afficher'}
            </button>
          </div>
          {erreurs[name] && <p className="text-red-600 text-sm mt-1">{erreurs[name]}</p>}
        </div>
      );
    }

    if (name === 'dateNaissance') {
      return (
        <div className="w-full">
          <label className="text-sm font-medium text-gray-700 dark:text-white">{label}<span className="text-red-600">*</span></label>
          <DatePicker selected={formData.dateNaissance} onChange={(date: Date) => setFormData({ ...formData, dateNaissance: date })} dateFormat="yyyy-MM-dd"
            className={`w-full mt-1 p-2 rounded-xl border ${erreurs[name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'} transition focus:ring-2 focus:outline-none`}
            placeholderText="Sélectionnez la date" />
          {erreurs[name] && <p className="text-red-600 text-sm mt-1">{erreurs[name]}</p>}
        </div>
      );
    }

    if (name === 'codePays' || name === 'numero') {
      return (
        <div className="sm:col-span-2 flex gap-2 items-center w-full">
          <select name="codePays" value={formData.codePays} onChange={handleChange} className="p-2 rounded-xl border border-gray-300 focus:ring-2 focus:outline-none focus:ring-blue-500">
            {codesPays.map(code => <option key={code} value={code}>{code}</option>)}
          </select>
          <input type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Numéro"
            className={`flex-1 p-2 rounded-xl border ${erreurs.numero ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'} transition focus:outline-none focus:ring-2`} />
          {erreurs.numero && <p className="text-red-600 text-sm mt-1">{erreurs.numero}</p>}
        </div>
      );
    }

    return (
      <div className="w-full">
        <label className="text-sm font-medium text-gray-700 dark:text-white">{label}{required && <span className="text-red-600"> *</span>}</label>
        <input type={type} name={name} value={formData[name] as string} onChange={handleChange}
          className={`w-full mt-1 p-2 rounded-xl border transition focus:ring-2 focus:outline-none ${erreurs[name] ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          placeholder={label} />
        {erreurs[name] && <p className="text-red-600 text-sm mt-1">{erreurs[name]}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative bg-black">
      {!videoFinished && (
        <>
          <video ref={videoRef1} className="absolute inset-0 w-full h-full object-cover opacity-1 transition-opacity duration-300 rounded-lg" playsInline onEnded={handleVideoEnd} />
          <video ref={videoRef2} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 rounded-lg" playsInline onEnded={handleVideoEnd} />
          {!soundUnlocked && <button onClick={enableSound} className="absolute top-4 left-4 bg-yellow-500 text-black p-2 rounded-lg z-10">🔊 Activer le son</button>}
          <div className="absolute bottom-4 left-4 z-10">
            {skipTimer > 0 ? <div className="bg-gray-700/50 text-white px-3 py-1 rounded-lg">Passer dans {skipTimer}s</div> : <button onClick={handleSkip} className="bg-yellow-500 text-black px-3 py-1 rounded-lg">Passer la vidéo</button>}
          </div>
        </>
      )}

      {videoFinished && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-white dark:bg-gray-900 w-full max-w-3xl p-6 sm:p-8 rounded-2xl shadow-xl z-20">
       <h1 className="text-3xl font-bold text-center text-blue-700 dark:text-white mb-2">
            INSCRIPTION DE L'APPRENANT
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Remplissez les champs ci-dessous pour vous inscrire ! Veuillez mettre vos vraies informations afin que nous puissions voir comment vous orienter en son temps,merci ! 
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {champ('Nom', 'nom')}
            {champ('Prénom', 'prenom')}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">Sexe <span className="text-red-600">*</span></label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                className={`w-full mt-1 p-2 rounded-xl border transition focus:ring-2 focus:outline-none ${erreurs.sexe ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              >
                <option value="">-- Choisir --</option>
                <option value="F">Féminin</option>
                <option value="M">Masculin</option>
                <option value="A">Autre</option>
              </select>
              {erreurs.sexe && <p className="text-red-600 text-sm mt-1">{erreurs.sexe}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">Date de naissance <span className="text-red-600">*</span></label>
              <DatePicker
  selected={formData.dateNaissance}
  onChange={(date: Date | null) => setFormData({ ...formData, dateNaissance: date as Date | null })}
  dateFormat="dd/MM/yyyy"
  className={`w-full mt-1 p-2 rounded-xl border transition focus:ring-2 focus:outline-none ${erreurs.dateNaissance ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
  placeholderText="JJ/MM/AAAA"
/>




              {erreurs.dateNaissance && <p className="text-red-600 text-sm mt-1">{erreurs.dateNaissance}</p>}
            </div>

            {champ('Lieu de naissance', 'lieuNaissance')}
            {champ('Nationalité', 'nationalite')}
            {champ('Pays de résidence', 'paysResidence')}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-white">Numéro WhatsApp <span className="text-red-600">*</span></label>
              <div className="flex space-x-2 mt-1">
                <select
                  name="codePays"
                  value={formData.codePays}
                  onChange={handleChange}
                  className="rounded-xl border border-gray-300 p-2"
                >
                  {codesPays.map(code => <option key={code} value={code}>{code}</option>)}
                </select>
                <input
                  type="tel"
                  name="numero"
                  placeholder="Ex: 0112345678"
                  value={formData.numero}
                  onChange={handleChange}
                  className={`flex-1 p-2 rounded-xl border transition focus:ring-2 focus:outline-none ${erreurs.numero ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                />
              </div>
              {erreurs.numero && <p className="text-red-600 text-sm mt-1">{erreurs.numero}</p>}
            </div>

            {champ('Email', 'email', 'email')}
            {champ('Mot de passe', 'password', 'password')}
            {champ('Confirmer mot de passe', 'confirmPassword', 'password')}

            {infoMotDePasse && (
              <p className="sm:col-span-2 text-sm text-yellow-600 font-medium bg-yellow-50 p-2 rounded-xl">
                {infoMotDePasse}
              </p>
            )}

            <div className="sm:col-span-2">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loadingForm}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-md transition duration-300 disabled:opacity-50"
        >
          {loadingForm ? 'Enregistrement...' : "Valider l'inscription"}
        </motion.button>
      </div>
    </form>

    {messageServeur && typeof messageServeur === 'string' && (
      <p className="text-center mt-4 text-sm font-semibold text-red-600 dark:text-red-400">
        {messageServeur}
      </p>
    )}

    {Array.isArray(messageServeur) && (
      <div className="mt-4 space-y-1">
        {messageServeur.map((err: any, index: number) => (
          <p key={index} className="text-center text-sm font-semibold text-red-600 dark:text-red-400">
            {err.msg}
          </p>
        ))}
      </div>
    )}
  </motion.div>
)}
 </div>
);
};

export default Inscription;   
