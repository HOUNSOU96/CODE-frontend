import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCircle,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  BookOpen,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CircleCheck,
  ImagePlus,
  ChevronRight,
} from "lucide-react";

import api from "@/utils/axios";

// ============================================================
// TYPES
// ============================================================

type TeacherProfile = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  pays_residence: string | null;
  subjects: string[];
  teacher_photo: string | null;
  teacher_profile_validated: boolean;
  enseignant: boolean;
  enseignant_actif: boolean;
};

// ============================================================
// COMPOSANT
// ============================================================

const ProfilEnseignant: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState<TeacherProfile | null>(null);

  const [photo, setPhoto] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================================
  // CHARGEMENT DU PROFIL
  // ==========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<TeacherProfile>(
            "/api/teacher/profile"
          );

        const data = response.data;

        setProfile(data);

        if (data.teacher_photo) {
          setPreview(
            `${import.meta.env.VITE_API_URL}${data.teacher_photo}`
          );
        }
      } catch (err: any) {
        console.error(
          "Erreur récupération profil enseignant :",
          err
        );

        const message =
          err?.response?.data?.detail ||
          "Impossible de récupérer votre profil enseignant.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================================
  // NETTOYAGE DE L'URL TEMPORAIRE DE LA PHOTO
  // ==========================================================

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ==========================================================
  // CHOIX DE LA PHOTO
  // ==========================================================

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // FORMAT
    // --------------------------------------------------------

    if (
      !["image/jpeg", "image/png"].includes(
        file.type
      )
    ) {
      setError(
        "La photo doit être au format JPG ou PNG."
      );

      event.target.value = "";
      return;
    }

    // --------------------------------------------------------
    // TAILLE
    // --------------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "La photo ne doit pas dépasser 5 Mo."
      );

      event.target.value = "";
      return;
    }

    // --------------------------------------------------------
    // NOUVELLE PHOTO
    // --------------------------------------------------------

    setPhoto(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
  };

  // ==========================================================
  // VALIDATION DU PROFIL
  // ==========================================================

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!photo) {
      setError(
        "Veuillez sélectionner votre photo avant de continuer."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "photo",
        photo
      );

      const response =
        await api.post(
          "/api/teacher/profile/validate",
          formData
        );

      setSuccess(
        response.data?.message ||
          "Votre profil enseignant a été validé avec succès."
      );

      setProfile((current) =>
        current
          ? {
              ...current,
              teacher_profile_validated:
                true,
              teacher_photo:
                response.data?.teacher_photo ||
                current.teacher_photo,
              subjects:
                response.data?.subjects ||
                current.subjects,
            }
          : current
      );
    } catch (err: any) {
      console.error(
        "Erreur validation profil enseignant :",
        err
      );

      const message =
        err?.response?.data?.detail ||
        "Impossible de valider votre profil enseignant.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // CONTINUER
  // ==========================================================

  const handleContinue = () => {
    if (
      !profile?.teacher_profile_validated
    ) {
      setError(
        "Vous devez valider votre profil enseignant avant de continuer."
      );
      return;
    }

    navigate("/enseignant");
  };

  // ==========================================================
  // CHARGEMENT
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

        <div className="relative">

          {/* Halo */}

          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col items-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">

              <Loader2
                className="h-9 w-9 animate-spin text-blue-400"
              />

            </div>

            <p className="mt-5 text-sm font-medium text-slate-300">
              Chargement de votre profil enseignant...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ERREUR DE CHARGEMENT
  // ==========================================================

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 flex items-center justify-center">

        <div className="w-full max-w-lg">

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">

            {/* Bandeau */}

            <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

            <div className="p-8 md:p-10 text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50">

                <AlertCircle className="h-10 w-10 text-red-500" />

              </div>

              <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
                Profil enseignant
              </h1>

              <p className="mt-3 text-sm leading-6 text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
              >
                Réessayer
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // ==========================================================
  // URL PHOTO
  // ==========================================================

  const photoUrl =
    preview ||
    (profile.teacher_photo
      ? `${import.meta.env.VITE_API_URL}${profile.teacher_photo}`
      : null);

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">

        {/* Décor */}

        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8 md:pb-20">

          {/* Mini navigation */}

          <div className="mb-12 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl">

                <GraduationCap
                  size={22}
                  className="text-blue-300"
                />

              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                  CODE
                </p>

                <p className="text-sm font-semibold text-white">
                  Espace enseignant
                </p>

              </div>

            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-md sm:flex">

              <ShieldCheck
                size={15}
                className="text-emerald-400"
              />

              Profil sécurisé

            </div>

          </div>

          {/* Texte */}

          <div className="max-w-3xl">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-bold text-blue-200 backdrop-blur-md">

              <Sparkles
                size={14}
              />

              BIENVENUE DANS L'ESPACE ENSEIGNANT

            </div>

            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">

              Construisons ensemble
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                l'avenir de l'éducation.
              </span>

            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">

              Complétez votre profil enseignant pour
              commencer à accompagner les apprenants,
              répondre à leurs questions et partager
              votre expertise sur CODE.

            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
          CONTENU
          ====================================================== */}

      <main className="-mt-8 relative z-10 mx-auto max-w-6xl px-4 pb-16 md:px-8">

        {/* ====================================================
            STATUT VALIDÉ
            ==================================================== */}

        {profile.teacher_profile_validated && (
          <div className="mb-6 overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-lg">

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">

                  <CircleCheck
                    size={25}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <p className="font-extrabold text-slate-900">
                    Profil enseignant validé
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Votre profil est complet et vous pouvez
                    accéder à votre espace enseignant.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Accéder à mon espace
                <ChevronRight size={17} />
              </button>

            </div>

          </div>
        )}

        {/* ====================================================
            CARTE PRINCIPALE
            ==================================================== */}

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

          {/* Barre supérieure */}

          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

          <div className="p-5 sm:p-7 md:p-10">

            {/* =================================================
                INTRODUCTION
                ================================================= */}

            <div className="mb-10 flex flex-col gap-4 border-b border-slate-100 pb-8 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">
                  Votre identité
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
                  Profil enseignant
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Vérifiez vos informations et ajoutez une
                  photo afin de finaliser votre profil.
                </p>

              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3">

                <ShieldCheck
                  size={19}
                  className={
                    profile.teacher_profile_validated
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }
                />

                <span className="text-sm font-bold text-slate-700">

                  {profile.teacher_profile_validated
                    ? "Profil validé"
                    : "Validation requise"}

                </span>

              </div>

            </div>

            {/* =================================================
                PHOTO + INFORMATIONS
                ================================================= */}

            <div className="grid gap-10 lg:grid-cols-[260px_1fr]">

              {/* =================================================
                  PHOTO
                  ================================================= */}

              <div className="flex flex-col items-center">

                <div className="relative">

                  {/* Halo */}

                  <div className="absolute -inset-4 rounded-full bg-blue-500/10 blur-2xl" />

                  {/* Photo */}

                  <div className="relative h-52 w-52 overflow-hidden rounded-full border-[6px] border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl ring-1 ring-slate-200">

                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`Photo de ${profile.prenom} ${profile.nom}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center">

                        <User
                          size={70}
                          className="text-slate-300"
                        />

                        <span className="mt-2 text-xs font-semibold text-slate-400">
                          Aucune photo
                        </span>

                      </div>
                    )}

                  </div>

                  {/* Bouton caméra */}

                  <label
                    htmlFor="teacher-photo"
                    className="absolute bottom-2 right-1 flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-white shadow-xl transition hover:scale-105 hover:bg-blue-700"
                    title="Choisir une photo"
                  >
                    <Camera size={24} />
                  </label>

                  <input
                    id="teacher-photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </div>

                <div className="mt-6 text-center">

                  <p className="text-base font-extrabold text-slate-900">
                    Votre photo
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Une photo claire et professionnelle
                    est recommandée.
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">

                    <ImagePlus size={13} />

                    JPG ou PNG · 5 Mo max.

                  </div>

                </div>

              </div>

              {/* =================================================
                  INFORMATIONS
                  ================================================= */}

              <div>

                <div className="mb-5 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    <User size={20} />

                  </div>

                  <div>

                    <h3 className="font-extrabold text-slate-900">
                      Informations personnelles
                    </h3>

                    <p className="text-xs text-slate-500">
                      Informations associées à votre compte
                    </p>

                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Nom */}

                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                        <User size={18} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Nom
                        </p>

                        <p className="mt-1 truncate font-bold text-slate-900">
                          {profile.nom ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Prénom */}

                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                        <User size={18} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Prénom
                        </p>

                        <p className="mt-1 truncate font-bold text-slate-900">
                          {profile.prenom ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Email */}

                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40 sm:col-span-2">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                        <Mail size={18} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Adresse e-mail
                        </p>

                        <p className="mt-1 break-all font-bold text-slate-900">
                          {profile.email}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Téléphone */}

                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                        <Phone size={18} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Téléphone / WhatsApp
                        </p>

                        <p className="mt-1 truncate font-bold text-slate-900">
                          {profile.telephone ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Pays */}

                  <div className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/40">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                        <MapPin size={18} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Pays de résidence
                        </p>

                        <p className="mt-1 truncate font-bold text-slate-900">
                          {profile.pays_residence ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                MATIÈRES
                ================================================= */}

            <div className="mt-10 border-t border-slate-100 pt-8">

              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                      <BookOpen size={20} />

                    </div>

                    <div>

                      <h3 className="font-extrabold text-slate-900">
                        Matières enseignées
                      </h3>

                      <p className="text-xs text-slate-500">
                        Les matières que vous avez déclarées
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">

                  {profile.subjects.length}{" "}
                  {profile.subjects.length > 1
                    ? "matières"
                    : "matière"}

                </div>

              </div>

              {profile.subjects.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {profile.subjects.map(
                    (subject, index) => (
                      <div
                        key={`${subject}-${index}`}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                      >

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">

                          <BookOpen size={18} />

                        </div>

                        <span className="min-w-0 flex-1 font-bold text-slate-800">
                          {subject}
                        </span>

                        <CheckCircle
                          size={17}
                          className="shrink-0 text-emerald-500"
                        />

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-5">

                  <div className="flex items-start gap-3">

                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />

                    <div>

                      <p className="font-bold text-amber-800">
                        Aucune matière déclarée
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        Vous devez avoir au moins une matière
                        déclarée pour pouvoir valider votre
                        profil enseignant.

                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                MESSAGES
                ================================================= */}

            {error && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-red-200 bg-red-50">

                <div className="flex items-start gap-3 p-5">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">

                    <AlertCircle
                      size={18}
                      className="text-red-600"
                    />

                  </div>

                  <div>

                    <p className="font-bold text-red-800">
                      Attention
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {error}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {success && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">

                <div className="flex items-start gap-3 p-5">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">

                    <CheckCircle
                      size={18}
                      className="text-emerald-600"
                    />

                  </div>

                  <div>

                    <p className="font-bold text-emerald-800">
                      Félicitations !
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      {success}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                ACTIONS
                ================================================= */}

            <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2 text-xs text-slate-400">

                <ShieldCheck size={16} />

                <span>
                  Vos informations sont associées à votre
                  compte enseignant.
                </span>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                {!profile.teacher_profile_validated && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      !photo
                    }
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >

                    {submitting ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                        Validation en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle
                          size={19}
                        />
                        Valider mon profil
                        <ArrowRight
                          size={17}
                          className="transition group-hover:translate-x-1"
                        />
                      </>
                    )}

                  </button>
                )}

                {profile.teacher_profile_validated && (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  >

                    Continuer vers mon espace enseignant

                    <ArrowRight
                      size={19}
                      className="transition group-hover:translate-x-1"
                    />

                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* ====================================================
            NOTE BAS DE PAGE
            ==================================================== */}

        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">

            <CircleCheck
              size={15}
              className="text-emerald-500"
            />

            Profil associé à votre compte CODE

          </div>

          <span className="hidden text-slate-300 sm:inline">
            •
          </span>

          <span className="text-xs text-slate-400">
            Espace réservé aux enseignants actifs
          </span>

        </div>

      </main>

    </div>
  );
};

export default ProfilEnseignant;