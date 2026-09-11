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
          const apiUrl =
            import.meta.env.VITE_API_URL || "";

          setPreview(
            data.teacher_photo.startsWith("http")
              ? data.teacher_photo
              : data.teacher_photo.startsWith("/")
                ? `${apiUrl}${data.teacher_photo}`
                : `${apiUrl}/${data.teacher_photo}`
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
      <div className="min-h-[70vh] flex items-center justify-center px-4">

        <div className="relative">

          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col items-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 shadow-lg dark:border-blue-900/50 dark:bg-blue-950/50">

              <Loader2
                className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
              />

            </div>

            <p className="mt-5 text-sm font-semibold text-slate-600 dark:text-slate-300">
              Chargement de votre profil enseignant...
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Veuillez patienter
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
      <div className="min-h-[70vh] flex items-center justify-center px-4">

        <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">

          <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600" />

          <div className="p-8 text-center md:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-500/10">

              <AlertCircle
                className="h-8 w-8 text-red-500 dark:text-red-400"
              />

            </div>

            <h1 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">
              Profil enseignant
            </h1>

            <p className="mt-3 leading-7 text-red-600 dark:text-red-200">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Réessayer
              <ArrowRight size={17} />
            </button>

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
      ? profile.teacher_photo.startsWith("http")
        ? profile.teacher_photo
        : profile.teacher_photo.startsWith("/")
          ? `${import.meta.env.VITE_API_URL || ""}${profile.teacher_photo}`
          : `${import.meta.env.VITE_API_URL || ""}/${profile.teacher_photo}`
      : null);

  // ==========================================================
  // RENDU
  // ==========================================================

  return (
    <div className="min-h-screen bg-transparent pb-16">

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

        {/* =====================================================
            BARRE SUPÉRIEURE
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                CODE
              </p>

              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Profil enseignant
              </h2>

            </div>

          </div>

          {profile.teacher_profile_validated && (
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-slate-800 dark:hover:text-blue-300"
            >
              <ArrowRight className="h-4 w-4" />
              Mon espace enseignant
            </button>
          )}

        </div>

        {/* =====================================================
            HERO COMPACT
        ====================================================== */}

        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-2xl dark:border-blue-900/40 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">

          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative px-6 py-8 md:px-8 lg:px-10">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-4xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">

                  <Sparkles className="h-4 w-4" />

                  Espace enseignant

                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">

                  Construisons ensemble{" "}

                  <span className="text-blue-600 dark:text-blue-300">
                    l'avenir de l'éducation.
                  </span>

                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-blue-100 md:text-base">

                  Complétez votre profil pour
                  accompagner les apprenants, répondre à leurs
                  questions et partager votre expertise sur{" "}

                  <span className="font-bold text-slate-900 dark:text-white">
                    CODE
                  </span>
                  .

                </p>

              </div>

              <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:flex">

                <ShieldCheck
                  size={17}
                  className={
                    profile.teacher_profile_validated
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }
                />

                {profile.teacher_profile_validated
                  ? "Profil sécurisé"
                  : "Validation requise"}

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            STATUT VALIDÉ
        ====================================================== */}

        {profile.teacher_profile_validated && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 shadow-lg dark:border-emerald-900/50 dark:bg-emerald-950/30">

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15">

                  <CircleCheck
                    size={23}
                    className="text-emerald-600 dark:text-emerald-400"
                  />

                </div>

                <div>

                  <p className="font-black text-emerald-900 dark:text-emerald-200">
                    Profil enseignant validé
                  </p>

                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300/80">
                    Votre profil est complet et vous pouvez
                    accéder à votre espace enseignant.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Accéder à mon espace
                <ChevronRight size={17} />
              </button>

            </div>

          </div>
        )}

        {/* =====================================================
            CARTE PRINCIPALE
        ====================================================== */}

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20">

          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

          <div className="p-5 sm:p-7 md:p-8 lg:p-10">

            {/* =================================================
                INTRODUCTION
            ================================================== */}

            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200/80 pb-7 dark:border-white/10 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  Votre identité
                </p>

                <h2 className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
                  Profil enseignant
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Vérifiez vos informations et ajoutez une
                  photo afin de finaliser votre profil.
                </p>

              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">

                <ShieldCheck
                  size={18}
                  className={
                    profile.teacher_profile_validated
                      ? "text-emerald-500"
                      : "text-amber-500"
                  }
                />

                <span className="text-sm font-black text-slate-700 dark:text-slate-200">

                  {profile.teacher_profile_validated
                    ? "Profil validé"
                    : "Validation requise"}

                </span>

              </div>

            </div>

            {/* =================================================
                PHOTO + INFORMATIONS
            ================================================== */}

            <div className="grid gap-8 lg:grid-cols-[220px_1fr] xl:grid-cols-[240px_1fr]">

              {/* =================================================
                  PHOTO
              ================================================== */}

              <div className="flex flex-col items-center">

                <div className="relative">

                  <div className="absolute -inset-4 rounded-full bg-blue-500/10 blur-2xl" />

                  <div className="relative h-44 w-44 overflow-hidden rounded-full border-[5px] border-white bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl ring-1 ring-slate-200 dark:border-slate-800 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">

                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`Photo de ${profile.prenom} ${profile.nom}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center">

                        <User
                          size={58}
                          className="text-slate-300 dark:text-slate-600"
                        />

                        <span className="mt-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                          Aucune photo
                        </span>

                      </div>
                    )}

                  </div>

                  <label
                    htmlFor="teacher-photo"
                    className="absolute bottom-1 right-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border-4 border-white bg-blue-600 text-white shadow-xl transition hover:scale-105 hover:bg-blue-700 dark:border-slate-950"
                    title="Choisir une photo"
                  >
                    <Camera size={21} />
                  </label>

                  <input
                    id="teacher-photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />

                </div>

                <div className="mt-5 text-center">

                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    Votre photo
                  </p>

                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Une photo claire et professionnelle
                    est recommandée.
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">

                    <ImagePlus size={13} />

                    JPG ou PNG · 5 Mo max.

                  </div>

                </div>

              </div>

              {/* =================================================
                  INFORMATIONS
              ================================================== */}

              <div>

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/50 dark:text-blue-400">

                    <User size={19} />

                  </div>

                  <div>

                    <h3 className="font-black text-slate-900 dark:text-white">
                      Informations personnelles
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Informations associées à votre compte
                    </p>

                  </div>

                </div>

                <div className="grid gap-3 sm:grid-cols-2">

                  {/* NOM */}

                  <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">

                        <User size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Nom
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">
                          {profile.nom ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* PRÉNOM */}

                  <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">

                        <User size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Prénom
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">
                          {profile.prenom ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20 sm:col-span-2">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">

                        <Mail size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Adresse e-mail
                        </p>

                        <p className="mt-1 break-all text-sm font-black text-slate-900 dark:text-white">
                          {profile.email}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* TÉLÉPHONE */}

                  <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">

                        <Phone size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Téléphone / WhatsApp
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">
                          {profile.telephone ||
                            "Non renseigné"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* PAYS */}

                  <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/20">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">

                        <MapPin size={17} />

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Pays de résidence
                        </p>

                        <p className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white">
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
            ================================================== */}

            <div className="mt-8 border-t border-slate-200/80 pt-7 dark:border-white/10">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/50 dark:text-indigo-400">

                    <BookOpen size={19} />

                  </div>

                  <div>

                    <h3 className="font-black text-slate-900 dark:text-white">
                      Matières enseignées
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Matières associées à votre profil
                    </p>

                  </div>

                </div>

                <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-black text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">

                  {profile.subjects.length}{" "}
                  {profile.subjects.length > 1
                    ? "matières"
                    : "matière"}

                </div>

              </div>

              {profile.subjects.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                  {profile.subjects.map(
                    (subject, index) => (
                      <div
                        key={`${subject}-${index}`}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-indigo-900/60 dark:hover:bg-indigo-950/30"
                      >

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/60 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white">

                          <BookOpen size={17} />

                        </div>

                        <span className="min-w-0 flex-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                          {subject}
                        </span>

                        <CheckCircle
                          size={16}
                          className="shrink-0 text-emerald-500 dark:text-emerald-400"
                        />

                      </div>
                    )
                  )}

                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">

                  <div className="flex items-start gap-3">

                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
                    />

                    <div>

                      <p className="font-black text-amber-800 dark:text-amber-300">
                        Aucune matière déclarée
                      </p>

                      <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-200/80">
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
            ================================================== */}

            {error && (
              <div className="mt-7 overflow-hidden rounded-2xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/25">

                <div className="flex items-start gap-3 p-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">

                    <AlertCircle
                      size={18}
                      className="text-red-600 dark:text-red-400"
                    />

                  </div>

                  <div>

                    <p className="font-black text-red-800 dark:text-red-300">
                      Attention
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-200/80">
                      {error}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {success && (
              <div className="mt-7 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/25">

                <div className="flex items-start gap-3 p-4">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">

                    <CheckCircle
                      size={18}
                      className="text-emerald-600 dark:text-emerald-400"
                    />

                  </div>

                  <div>

                    <p className="font-black text-emerald-800 dark:text-emerald-300">
                      Félicitations !
                    </p>

                    <p className="mt-1 text-sm leading-6 text-emerald-700 dark:text-emerald-200/80">
                      {success}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================== */}

            <div className="mt-8 flex flex-col gap-5 border-t border-slate-200/80 pt-7 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-2 text-xs leading-5 text-slate-400 dark:text-slate-500">

                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0"
                />

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
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
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
                        <CheckCircle size={19} />

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
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
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

        {/* =====================================================
            NOTE BAS DE PAGE
        ====================================================== */}

        <div className="mt-5 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">

            <CircleCheck
              size={15}
              className="text-emerald-500"
            />

            Profil associé à votre compte CODE

          </div>

          <span className="hidden text-slate-300 dark:text-slate-700 sm:inline">
            •
          </span>

          <span className="text-xs text-slate-400 dark:text-slate-500">
            Espace réservé aux enseignants actifs
          </span>

        </div>

      </div>

    </div>
  );
};

export default ProfilEnseignant;