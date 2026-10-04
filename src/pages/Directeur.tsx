import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Crown,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  School,
  Trash2,
  UserCheck,
  UserRound,
  UserX,
  X,
  XCircle,
} from "lucide-react";

import api from "@/utils/axios";
import { useAuth } from "@/context/AuthContext";

import {
  getOfflineData,
  saveOfflineData,
  STORES,
} from "@/offline/offlineDB";

/* ============================================================
   TYPES
============================================================ */

type DirectorSchool = {
  id: number;
  nom: string;
  adresse?: string | null;
  ville?: string | null;
  departement?: string | null;
  pays?: string | null;
  type_enseignement?: string | null;
  statut?: string | null;
  email?: string | null;
  telephone?: string | null;
  is_active: boolean;
  director_id: number;
  assigned_at?: string | null;
};

type DirectorSchoolsResponse = {
  schools: DirectorSchool[];
};

type DirectorTeacher = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  enseignant?: boolean;
  enseignant_actif?: boolean;
  school_membership_id: number;
  academic_year: string;
};

type DirectorTeachersResponse = {
  school_id: number;
  teachers: DirectorTeacher[];
};

type DirectorStudent = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  school_membership_id: number;
  academic_year: string;
};

type DirectorStudentsResponse = {
  school_id: number;
  students: DirectorStudent[];
};

type DirectorRequestUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  enseignant?: boolean;
  enseignant_actif?: boolean;
};

type DirectorRequestSchool = {
  id: number;
  nom: string;
  ville?: string | null;
  departement?: string | null;
};

type DirectorRequest = {
  membership_id: number;
  user: DirectorRequestUser;
  school: DirectorRequestSchool;
  role: "teacher" | "student";
  status: "pending" | "approved" | "rejected";
  academic_year: string;
  requested_at?: string | null;
};

type DirectorRequestsResponse = {
  requests: DirectorRequest[];
};

type DirectorUserListItem = {
  id: number;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
};

type DirectorUsersListResponse =
  | DirectorUserListItem[]
  | {
      users?: DirectorUserListItem[];
      inscrits?: DirectorUserListItem[];
      data?: DirectorUserListItem[];
    };

type SectionId =
  | "overview"
  | "teachers"
  | "students"
  | "requests";

/* ============================================================
   TYPES CACHE HORS LIGNE
============================================================ */

type CachedDirectorSchools = {
  id: string;
  type: "director_schools";
  schools: DirectorSchool[];
  cachedAt: number;
};

type CachedDirectorTeachers = {
  id: string;
  type: "director_teachers";
  schoolId: number;
  teachers: DirectorTeacher[];
  cachedAt: number;
};

type CachedDirectorStudents = {
  id: string;
  type: "director_students";
  schoolId: number;
  students: DirectorStudent[];
  cachedAt: number;
};

type CachedDirectorRequests = {
  id: string;
  type: "director_requests";
  requests: DirectorRequest[];
  cachedAt: number;
};

type CachedDirectorPhone = {
  id: string;
  type: "director_phone";
  phone: string | null;
  cachedAt: number;
};

/* ============================================================
   COMPOSANT
============================================================ */

const Directeur: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ==========================================================
     ETATS
  ========================================================== */

  const [schools, setSchools] = useState<DirectorSchool[]>([]);
  const [teachers, setTeachers] = useState<DirectorTeacher[]>([]);
  const [students, setStudents] = useState<DirectorStudent[]>([]);
  const [requests, setRequests] = useState<DirectorRequest[]>([]);

  const [selectedSchoolId, setSelectedSchoolId] =
    useState<number | null>(null);

  const [activeSection, setActiveSection] =
    useState<SectionId>("overview");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [teachersLoading, setTeachersLoading] =
    useState(false);

  const [studentsLoading, setStudentsLoading] =
    useState(false);

  const [requestsLoading, setRequestsLoading] =
    useState(false);

  const [processingRequestId, setProcessingRequestId] =
    useState<number | null>(null);

  const [removingTeacherId, setRemovingTeacherId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const [showSchoolSelector, setShowSchoolSelector] =
    useState(false);

  const [teacherToRemove, setTeacherToRemove] =
    useState<{
      teacher: DirectorTeacher;
      schoolId: number;
      schoolName: string;
    } | null>(null);

  const [directorPhone, setDirectorPhone] =
    useState<string | null>(null);

  /* ==========================================================
     ETAT HORS LIGNE
  ========================================================== */

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    return !navigator.onLine;
  });

  const [usingOfflineCache, setUsingOfflineCache] =
    useState(false);

  /* ==========================================================
     SURVEILLANCE DE LA CONNEXION
  ========================================================== */

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setUsingOfflineCache(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* ==========================================================
     ECOLE SELECTIONNEE
  ========================================================== */

  const selectedSchool = useMemo(() => {
    if (selectedSchoolId === null) {
      return schools[0] || null;
    }

    return (
      schools.find(
        (school) => school.id === selectedSchoolId
      ) || schools[0] || null
    );
  }, [schools, selectedSchoolId]);

  /* ==========================================================
     CHARGER LES ECOLES DU DIRECTEUR
  ========================================================== */

  const fetchDirectorSchools = useCallback(
    async (): Promise<DirectorSchool[]> => {
      try {
        const response =
          await api.get<DirectorSchoolsResponse>(
            "/api/schools/director/my-schools"
          );

        const directorSchools =
          response.data.schools || [];

        setSchools(directorSchools);
        setUsingOfflineCache(false);

        await saveOfflineData<CachedDirectorSchools>(
          STORES.documents,
          {
            id: "director_schools",
            type: "director_schools",
            schools: directorSchools,
            cachedAt: Date.now(),
          }
        ).catch((cacheError) => {
          console.warn(
            "Impossible de mettre en cache les écoles du directeur :",
            cacheError
          );
        });

        if (directorSchools.length > 0) {
          setSelectedSchoolId((currentId) => {
            if (
              currentId !== null &&
              directorSchools.some(
                (school) => school.id === currentId
              )
            ) {
              return currentId;
            }

            return directorSchools[0].id;
          });
        } else {
          setSelectedSchoolId(null);
        }

        return directorSchools;
      } catch (err) {
        const cached =
          await getOfflineData<CachedDirectorSchools>(
            STORES.documents,
            "director_schools"
          ).catch(() => null);

        if (cached?.schools) {
          setSchools(cached.schools);
          setUsingOfflineCache(true);

          if (cached.schools.length > 0) {
            setSelectedSchoolId((currentId) => {
              if (
                currentId !== null &&
                cached.schools.some(
                  (school) =>
                    school.id === currentId
                )
              ) {
                return currentId;
              }

              return cached.schools[0].id;
            });
          } else {
            setSelectedSchoolId(null);
          }

          return cached.schools;
        }

        throw err;
      }
    },
    []
  );

  /* ==========================================================
     CHARGER LE TELEPHONE DU DIRECTEUR

     Le téléphone est récupéré depuis l'utilisateur en base,
     comme dans ListeInscrits.tsx.
  ========================================================== */

  const fetchDirectorPhone = useCallback(
    async () => {
      if (!user) {
        setDirectorPhone(null);
        return;
      }

      try {
        const response =
          await api.get<DirectorUsersListResponse>(
            "/api/admin/liste-inscrits"
          );

        const rawData = response.data;

        const usersList = Array.isArray(rawData)
          ? rawData
          : rawData.users ||
            rawData.inscrits ||
            rawData.data ||
            [];

        const director = usersList.find(
          (item) =>
            Number(item.id) ===
            Number((user as any).id)
        );

        const phone =
          director?.telephone || null;

        setDirectorPhone(phone);
        setUsingOfflineCache(false);

        await saveOfflineData<CachedDirectorPhone>(
          STORES.documents,
          {
            id: `director_phone_${String(
              (user as any).id
            )}`,
            type: "director_phone",
            phone,
            cachedAt: Date.now(),
          }
        ).catch((cacheError) => {
          console.warn(
            "Impossible de mettre en cache le téléphone du directeur :",
            cacheError
          );
        });
      } catch (err: any) {
        console.error(
          "Erreur récupération téléphone du directeur :",
          err
        );

        const cacheId = `director_phone_${String(
          (user as any).id
        )}`;

        const cached =
          await getOfflineData<CachedDirectorPhone>(
            STORES.documents,
            cacheId
          ).catch(() => null);

        if (cached) {
          setDirectorPhone(cached.phone);
          setUsingOfflineCache(true);
        } else {
          setDirectorPhone(null);
        }
      }
    },
    [user]
  );

  /* ==========================================================
     CHARGER LES ENSEIGNANTS
  ========================================================== */

  const fetchTeachers = useCallback(
    async (schoolId: number) => {
      setTeachersLoading(true);

      try {
        const response =
          await api.get<DirectorTeachersResponse>(
            `/api/schools/director/${schoolId}/teachers`
          );

        const schoolTeachers =
          response.data.teachers || [];

        setTeachers(schoolTeachers);
        setUsingOfflineCache(false);

        await saveOfflineData<CachedDirectorTeachers>(
          STORES.documents,
          {
            id: `director_teachers_${schoolId}`,
            type: "director_teachers",
            schoolId,
            teachers: schoolTeachers,
            cachedAt: Date.now(),
          }
        ).catch((cacheError) => {
          console.warn(
            "Impossible de mettre en cache les enseignants :",
            cacheError
          );
        });
      } catch (err: any) {
        console.error(
          "Erreur chargement enseignants :",
          err
        );

        const cached =
          await getOfflineData<CachedDirectorTeachers>(
            STORES.documents,
            `director_teachers_${schoolId}`
          ).catch(() => null);

        if (cached) {
          setTeachers(cached.teachers || []);
          setUsingOfflineCache(true);
          return;
        }

        setTeachers([]);

        const detail =
          err?.response?.data?.detail;

        if (detail) {
          setError(detail);
        }
      } finally {
        setTeachersLoading(false);
      }
    },
    []
  );

  /* ==========================================================
     CHARGER LES APPRENANTS
  ========================================================== */

  const fetchStudents = useCallback(
    async (schoolId: number) => {
      setStudentsLoading(true);

      try {
        const response =
          await api.get<DirectorStudentsResponse>(
            `/api/schools/director/${schoolId}/students`
          );

        const schoolStudents =
          response.data.students || [];

        setStudents(schoolStudents);
        setUsingOfflineCache(false);

        await saveOfflineData<CachedDirectorStudents>(
          STORES.documents,
          {
            id: `director_students_${schoolId}`,
            type: "director_students",
            schoolId,
            students: schoolStudents,
            cachedAt: Date.now(),
          }
        ).catch((cacheError) => {
          console.warn(
            "Impossible de mettre en cache les apprenants :",
            cacheError
          );
        });
      } catch (err: any) {
        console.error(
          "Erreur chargement apprenants :",
          err
        );

        const cached =
          await getOfflineData<CachedDirectorStudents>(
            STORES.documents,
            `director_students_${schoolId}`
          ).catch(() => null);

        if (cached) {
          setStudents(cached.students || []);
          setUsingOfflineCache(true);
          return;
        }

        setStudents([]);

        const detail =
          err?.response?.data?.detail;

        if (detail) {
          setError(detail);
        }
      } finally {
        setStudentsLoading(false);
      }
    },
    []
  );

  /* ==========================================================
     CHARGER LES DEMANDES
  ========================================================== */

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);

    try {
      const response =
        await api.get<DirectorRequestsResponse>(
          "/api/schools/director/requests"
        );

      const directorRequests =
        response.data.requests || [];

      setRequests(directorRequests);
      setUsingOfflineCache(false);

      await saveOfflineData<CachedDirectorRequests>(
        STORES.documents,
        {
          id: "director_requests",
          type: "director_requests",
          requests: directorRequests,
          cachedAt: Date.now(),
        }
      ).catch((cacheError) => {
        console.warn(
          "Impossible de mettre en cache les demandes :",
          cacheError
        );
      });
    } catch (err: any) {
      console.error(
        "Erreur chargement demandes :",
        err
      );

      const cached =
        await getOfflineData<CachedDirectorRequests>(
          STORES.documents,
          "director_requests"
        ).catch(() => null);

      if (cached) {
        setRequests(cached.requests || []);
        setUsingOfflineCache(true);
        return;
      }

      setRequests([]);

      const detail =
        err?.response?.data?.detail;

      if (detail) {
        setError(detail);
      }
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  /* ==========================================================
     CHARGEMENT INITIAL
  ========================================================== */

  const loadData = useCallback(
    async (showRefreshLoader = false) => {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const directorSchools =
          await fetchDirectorSchools();

        await fetchRequests();
        await fetchDirectorPhone();

        if (directorSchools.length > 0) {
          const schoolId =
            selectedSchoolId &&
            directorSchools.some(
              (school) =>
                school.id === selectedSchoolId
            )
              ? selectedSchoolId
              : directorSchools[0].id;

          await Promise.all([
            fetchTeachers(schoolId),
            fetchStudents(schoolId),
          ]);
        } else {
          setTeachers([]);
          setStudents([]);
        }
      } catch (err: any) {
        console.error(
          "Erreur chargement administration directeur :",
          err
        );

        const detail =
          err?.response?.data?.detail;

        setError(
          detail ||
            "Impossible de charger les données de l'administration de l'école."
        );

        if (!isOffline) {
          setSchools([]);
          setTeachers([]);
          setStudents([]);
          setRequests([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      fetchDirectorSchools,
      fetchRequests,
      fetchDirectorPhone,
      fetchTeachers,
      fetchStudents,
      selectedSchoolId,
      isOffline,
    ]
  );

  useEffect(() => {
    void loadData();
  }, []);

  /* ==========================================================
     RECHARGER LE TELEPHONE DU DIRECTEUR LORSQUE
     L'UTILISATEUR AUTHENTIFIE EST DISPONIBLE
  ========================================================== */

  useEffect(() => {
    void fetchDirectorPhone();
  }, [fetchDirectorPhone]);

  /* ==========================================================
     RECHARGER LES DONNEES D'UNE ECOLE
  ========================================================== */

  useEffect(() => {
    if (!selectedSchool) {
      setTeachers([]);
      setStudents([]);
      return;
    }

    void Promise.all([
      fetchTeachers(selectedSchool.id),
      fetchStudents(selectedSchool.id),
    ]);
  }, [
    selectedSchool?.id,
    fetchTeachers,
    fetchStudents,
  ]);

  /* ==========================================================
     REVENIR AUTOMATIQUEMENT AUX DONNEES SERVEUR
     LORSQUE LA CONNEXION REVIENT
  ========================================================== */

  useEffect(() => {
    if (!isOffline) {
      void loadData(true);
    }
  }, [isOffline]);

  /* ==========================================================
     CHANGER D'ECOLE
  ========================================================== */

  const handleSelectSchool = (
    schoolId: number
  ) => {
    setSelectedSchoolId(schoolId);
    setShowSchoolSelector(false);
    setActiveSection("overview");
    setError("");
  };

  /* ==========================================================
     ACCEPTER / REFUSER UNE DEMANDE
  ========================================================== */

  const handleRequestDecision = async (
    membershipId: number,
    decision: "approved" | "rejected"
  ) => {
    if (isOffline) {
      setError(
        "Cette action nécessite une connexion Internet. La demande ne peut pas être traitée hors ligne."
      );
      return;
    }

    setProcessingRequestId(membershipId);
    setError("");

    try {
      await api.post(
        `/api/schools/director/requests/${membershipId}/decision`,
        {
          decision,
        }
      );

      await fetchRequests();

      if (selectedSchool) {
        await Promise.all([
          fetchTeachers(selectedSchool.id),
          fetchStudents(selectedSchool.id),
        ]);
      }
    } catch (err: any) {
      console.error(
        "Erreur décision demande :",
        err
      );

      const detail =
        err?.response?.data?.detail;

      setError(
        detail ||
          "Impossible de traiter cette demande."
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  /* ==========================================================
     OUVRIR CONFIRMATION SUPPRESSION ENSEIGNANT
  ========================================================== */

  const askRemoveTeacher = (
    teacher: DirectorTeacher
  ) => {
    if (!selectedSchool) {
      return;
    }

    setTeacherToRemove({
      teacher,
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.nom,
    });
  };

  /* ==========================================================
     RETIRER UN ENSEIGNANT
  ========================================================== */

  const handleRemoveTeacher = async () => {
    if (!teacherToRemove) {
      return;
    }

    if (isOffline) {
      setError(
        "Cette action nécessite une connexion Internet. L'enseignant ne peut pas être retiré hors ligne."
      );
      return;
    }

    const {
      teacher,
      schoolId,
    } = teacherToRemove;

    setRemovingTeacherId(teacher.id);
    setError("");

    try {
      await api.delete(
        `/api/schools/director/${schoolId}/teachers/${teacher.id}`
      );

      setTeacherToRemove(null);

      await fetchTeachers(schoolId);
    } catch (err: any) {
      console.error(
        "Erreur retrait enseignant :",
        err
      );

      const detail =
        err?.response?.data?.detail;

      setError(
        detail ||
          "Impossible de retirer cet enseignant de l'école."
      );
    } finally {
      setRemovingTeacherId(null);
    }
  };

  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (
    value?: string | null
  ) => {
    if (!value) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(new Date(value));
    } catch {
      return value;
    }
  };

  /* ==========================================================
     NOM UTILISATEUR
  ========================================================== */

  const directorName = useMemo(() => {
    if (!user) {
      return "Directeur";
    }

    const firstName =
      (user as any).prenom || "";

    const lastName =
      (user as any).nom || "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    return fullName || "Directeur";
  }, [user]);

  /* ==========================================================
     COORDONNEES DU DIRECTEUR
  ========================================================== */

  const directorEmail = useMemo(() => {
    if (!user) {
      return null;
    }

    return (
      (user as any).email ||
      null
    );
  }, [user]);

  /* ==========================================================
     COMPTEURS
  ========================================================== */

  const pendingRequestsCount =
    requests.length;

  const teacherCount =
    teachers.length;

  const studentCount =
    students.length;

  /* ==========================================================
     SECTION NAVIGATION
  ========================================================== */

  const sections: {
    id: SectionId;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      id: "overview",
      label: "Vue d'ensemble",
      icon: School,
    },
    {
      id: "teachers",
      label: "Enseignants",
      icon: UserCheck,
      count: teacherCount,
    },
    {
      id: "students",
      label: "Apprenants",
      icon: GraduationCap,
      count: studentCount,
    },
    {
      id: "requests",
      label: "Demandes",
      icon: Clock3,
      count: pendingRequestsCount,
    },
  ];

  /* ==========================================================
     CHARGEMENT
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/10">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
            </div>

            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              Chargement de votre administration...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ACCES REFUSE / AUCUNE ECOLE
  ========================================================== */

  if (!schools.length) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/enseignant")}
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à mon espace
          </button>

          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-xl dark:border-red-500/20 dark:bg-slate-900">
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-500/10">
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                Administration inaccessible
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Votre compte n'est actuellement directeur
                d'aucune école active.
              </p>

              <button
                type="button"
                onClick={() => void loadData(true)}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-amber-700"
              >
                <RefreshCw className="h-4 w-4" />
                Vérifier à nouveau
              </button>
            </div>
          </div>
        </div>

        {isOffline && (
          <OfflineIndicator />
        )}
      </div>
    );
  }

  /* ==========================================================
     RENDU
  ========================================================== */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ====================================================
            EN-TETE
        ==================================================== */}

        <div className="mb-6 overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50 shadow-xl dark:border-amber-500/20 dark:from-amber-950/40 dark:via-slate-900 dark:to-yellow-950/20">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 shadow-sm dark:bg-amber-500/15">
                  <Crown className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                </div>

                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                      Administration école
                    </span>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      Directeur
                    </span>

                    {usingOfflineCache && (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Données en cache
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    Bonjour, {directorName}
                  </h1>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Gérez les membres et les demandes des
                    établissements que vous dirigez.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/enseignant")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Mon espace
                </button>

                <button
                  type="button"
                  onClick={() => void loadData(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-black text-white shadow-lg transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            ERREUR
        ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-950/20">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-red-800 dark:text-red-300">
                Une erreur est survenue
              </p>

              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-red-500 transition hover:bg-red-100 dark:hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ====================================================
            SELECTEUR D'ECOLE
        ==================================================== */}

        <div className="relative mb-6">
          <button
            type="button"
            onClick={() =>
              setShowSchoolSelector(
                (current) => !current
              )
            }
            className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">
              <School className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                École administrée
              </p>

              <p className="truncate text-base font-black text-slate-900 dark:text-white">
                {selectedSchool?.nom}
              </p>

              {(selectedSchool?.ville ||
                selectedSchool?.departement) && (
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {[
                    selectedSchool.ville,
                    selectedSchool.departement,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>

            {schools.length > 1 && (
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform ${
                  showSchoolSelector
                    ? "rotate-180"
                    : ""
                }`}
              />
            )}
          </button>

          {showSchoolSelector &&
            schools.length > 1 && (
              <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                {schools.map((school) => {
                  const selected =
                    school.id ===
                    selectedSchool?.id;

                  return (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() =>
                        handleSelectSchool(
                          school.id
                        )
                      }
                      className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left last:border-b-0 dark:border-slate-800 ${
                        selected
                          ? "bg-amber-50 dark:bg-amber-500/10"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-amber-100 dark:bg-amber-500/15"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        <School
                          className={`h-5 w-5 ${
                            selected
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-500"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                          {school.nom}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {[
                            school.ville,
                            school.departement,
                          ]
                            .filter(Boolean)
                            .join(" · ") ||
                            "Localisation non renseignée"}
                        </p>
                      </div>

                      {selected && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const active =
              activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setActiveSection(section.id)
                }
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition ${
                  active
                    ? "bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-500/15 dark:text-amber-400"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />

                <span>{section.label}</span>

                {section.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active
                        ? "bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {section.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ====================================================
            VUE D'ENSEMBLE
        ==================================================== */}

        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* ECOLE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/10">
                    <School className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>

                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {schools.length}
                  </span>
                </div>

                <p className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                  École{schools.length > 1 ? "s" : ""}
                  {" "}dirigée
                  {schools.length > 1 ? "s" : ""}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Établissement
                  {schools.length > 1
                    ? "s"
                    : ""} associé
                  {schools.length > 1
                    ? "s"
                    : ""} à votre direction
                </p>
              </div>

              {/* ENSEIGNANTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>

                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {teacherCount}
                  </span>
                </div>

                <p className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                  Enseignants
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enseignants actuellement rattachés
                </p>
              </div>

              {/* APPRENANTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {studentCount}
                  </span>
                </div>

                <p className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                  Apprenants
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Apprenants actuellement inscrits
                </p>
              </div>

              {/* DEMANDES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-500/10">
                    <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>

                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {pendingRequestsCount}
                  </span>
                </div>

                <p className="mt-4 text-sm font-black text-slate-900 dark:text-white">
                  Demandes en attente
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Demandes nécessitant votre décision
                </p>
              </div>
            </div>

            {/* INFORMATIONS ECOLE */}

            {selectedSchool && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <School className="h-5 w-5 text-amber-600 dark:text-amber-400" />

                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white">
                        Informations de l'établissement
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Données enregistrées dans CODE
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoItem
                    label="Nom"
                    value={selectedSchool.nom}
                  />

                  <InfoItem
                    label="Adresse"
                    value={
                      selectedSchool.adresse
                    }
                  />

                  <InfoItem
                    label="Ville"
                    value={
                      selectedSchool.ville
                    }
                  />

                  <InfoItem
                    label="Département"
                    value={
                      selectedSchool.departement
                    }
                  />

                  <InfoItem
                    label="Pays"
                    value={selectedSchool.pays}
                  />

                  <InfoItem
                    label="Type d'enseignement"
                    value={
                      selectedSchool.type_enseignement
                    }
                  />

                  <InfoItem
                    label="Statut"
                    value={selectedSchool.statut}
                  />

                  <InfoItem
                    label="Email du directeur"
                    value={directorEmail}
                  />

                  <InfoItem
                    label="Téléphone du directeur"
                    value={directorPhone}
                  />
                </div>
              </div>
            )}

            {/* DEMANDES RAPIDES */}

            {requests.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm dark:border-orange-500/20 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4 dark:border-orange-500/10">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />

                    <div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white">
                        Demandes en attente
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ces demandes attendent votre décision.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        "requests"
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs font-black text-amber-600 hover:text-amber-700 dark:text-amber-400"
                  >
                    Voir tout
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests
                    .slice(0, 5)
                    .map((request) => (
                      <RequestRow
                        key={
                          request.membership_id
                        }
                        request={request}
                        processing={
                          processingRequestId ===
                          request.membership_id
                        }
                        onApprove={() =>
                          void handleRequestDecision(
                            request.membership_id,
                            "approved"
                          )
                        }
                        onReject={() =>
                          void handleRequestDecision(
                            request.membership_id,
                            "rejected"
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            ENSEIGNANTS
        ==================================================== */}

        {activeSection === "teachers" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />

                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Enseignants de l'école
                    </h2>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-black text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                      {teacherCount}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {selectedSchool?.nom}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    selectedSchool &&
                    void fetchTeachers(
                      selectedSchool.id
                    )
                  }
                  disabled={teachersLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      teachersLoading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Actualiser
                </button>
              </div>
            </div>

            {teachersLoading ? (
              <LoadingBlock text="Chargement des enseignants..." />
            ) : teachers.length === 0 ? (
              <EmptyBlock
                icon={UserX}
                title="Aucun enseignant"
                text="Aucun enseignant approuvé n'est actuellement rattaché à cette école."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Enseignant
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Email
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Téléphone
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Année scolaire
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Statut
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teachers.map(
                      (teacher) => (
                        <tr
                          key={
                            teacher.id
                          }
                          className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
                                <UserRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                  {
                                    teacher.prenom
                                  }{" "}
                                  {
                                    teacher.nom
                                  }
                                </p>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  ID :{" "}
                                  {
                                    teacher.id
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {teacher.email ||
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {teacher.telephone ||
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {
                                teacher.academic_year
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approuvé
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                askRemoveTeacher(
                                  teacher
                                )
                              }
                              disabled={
                                removingTeacherId ===
                                  teacher.id ||
                                isOffline
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isOffline
                                ? "Hors ligne"
                                : "Retirer"}
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            APPRENANTS
        ==================================================== */}

        {activeSection === "students" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Apprenants de l'école
                    </h2>

                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {studentCount}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {selectedSchool?.nom}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    selectedSchool &&
                    void fetchStudents(
                      selectedSchool.id
                    )
                  }
                  disabled={studentsLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      studentsLoading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Actualiser
                </button>
              </div>
            </div>

            {studentsLoading ? (
              <LoadingBlock text="Chargement des apprenants..." />
            ) : students.length === 0 ? (
              <EmptyBlock
                icon={GraduationCap}
                title="Aucun apprenant"
                text="Aucun apprenant approuvé n'est actuellement rattaché à cette école."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Apprenant
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Email
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Téléphone
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Année scolaire
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Statut
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map(
                      (student) => (
                        <tr
                          key={
                            student.id
                          }
                          className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/10">
                                <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>

                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">
                                  {
                                    student.prenom
                                  }{" "}
                                  {
                                    student.nom
                                  }
                                </p>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  ID :{" "}
                                  {
                                    student.id
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {student.email ||
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <Phone className="h-4 w-4 text-slate-400" />
                              {student.telephone ||
                                "—"}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {
                                student.academic_year
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approuvé
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            DEMANDES
        ==================================================== */}

        {activeSection === "requests" && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />

                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Demandes d'adhésion
                    </h2>

                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-black text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                      {pendingRequestsCount}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Seules les demandes concernant vos
                    écoles sont affichées.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    void fetchRequests()
                  }
                  disabled={requestsLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      requestsLoading
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  Actualiser
                </button>
              </div>
            </div>

            {requestsLoading ? (
              <LoadingBlock text="Chargement des demandes..." />
            ) : requests.length === 0 ? (
              <EmptyBlock
                icon={CheckCircle2}
                title="Aucune demande en attente"
                text="Toutes les demandes concernant vos écoles ont été traitées."
              />
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map(
                  (request) => (
                    <RequestRow
                      key={
                        request.membership_id
                      }
                      request={request}
                      processing={
                        processingRequestId ===
                        request.membership_id
                      }
                      onApprove={() =>
                        void handleRequestDecision(
                          request.membership_id,
                          "approved"
                        )
                      }
                      onReject={() =>
                        void handleRequestDecision(
                          request.membership_id,
                          "rejected"
                        )
                      }
                      detailed
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          MODAL RETRAIT ENSEIGNANT
      ====================================================== */}

      {teacherToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/10">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Retirer l'enseignant
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Action limitée à cette école
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setTeacherToRemove(null)
                }
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Voulez-vous retirer{" "}
                <strong className="font-black text-slate-900 dark:text-white">
                  {
                    teacherToRemove.teacher
                      .prenom
                  }{" "}
                  {
                    teacherToRemove.teacher
                      .nom
                  }
                </strong>{" "}
                de{" "}
                <strong className="font-black text-slate-900 dark:text-white">
                  {
                    teacherToRemove.schoolName
                  }
                </strong>
                ?
              </p>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10">
                <p className="text-xs leading-5 text-amber-800 dark:text-amber-300">
                  Cette action retire uniquement son
                  rattachement à cette école. Elle ne
                  désactive pas son compte enseignant
                  CODE et ne le retire pas de ses autres
                  écoles.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setTeacherToRemove(null)
                }
                disabled={
                  removingTeacherId !== null
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleRemoveTeacher()
                }
                disabled={
                  removingTeacherId !== null ||
                  isOffline
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removingTeacherId !== null ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {isOffline
                  ? "Connexion requise"
                  : "Retirer de l'école"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          INDICATEUR HORS LIGNE
      ====================================================== */}

      {isOffline && (
        <OfflineIndicator />
      )}
    </div>
  );
};

/* ============================================================
   COMPOSANTS AUXILIAIRES
============================================================ */

type InfoItemProps = {
  label: string;
  value?: string | null;
};

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
}) => {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
        {value || "Non renseigné"}
      </p>
    </div>
  );
};

/* ============================================================
   LIGNE DEMANDE
============================================================ */

type RequestRowProps = {
  request: DirectorRequest;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
  detailed?: boolean;
};

const RequestRow: React.FC<RequestRowProps> = ({
  request,
  processing,
  onApprove,
  onReject,
  detailed = false,
}) => {
  const isTeacher =
    request.role === "teacher";

  return (
    <div className="p-5 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
        {/* UTILISATEUR */}

        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isTeacher
                ? "bg-blue-100 dark:bg-blue-500/10"
                : "bg-emerald-100 dark:bg-emerald-500/10"
            }`}
          >
            {isTeacher ? (
              <UserCheck
                className={`h-5 w-5 ${
                  isTeacher
                    ? "text-blue-600 dark:text-blue-400"
                    : ""
                }`}
              />
            ) : (
              <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                {request.user.prenom}{" "}
                {request.user.nom}
              </p>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                  isTeacher
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                }`}
              >
                {isTeacher
                  ? "Enseignant"
                  : "Apprenant"}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {request.user.email ||
                  "Email non renseigné"}
              </span>

              {request.user.telephone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {
                    request.user.telephone
                  }
                </span>
              )}
            </div>

            {detailed && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  École :{" "}
                  {request.school.nom}
                </span>

                <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Année :{" "}
                  {
                    request.academic_year
                  }
                </span>

                {request.school
                  .ville && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Ville :{" "}
                    {
                      request.school
                        .ville
                    }
                  </span>
                )}
              </div>
            )}

            <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
              Demande reçue le{" "}
              {formatRequestDate(
                request.requested_at
              )}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onReject}
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/15"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Refuser
          </button>

          <button
            type="button"
            onClick={onApprove}
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CHARGEMENT
============================================================ */

type LoadingBlockProps = {
  text: string;
};

const LoadingBlock: React.FC<
  LoadingBlockProps
> = ({ text }) => {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />

        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
};

/* ============================================================
   VIDE
============================================================ */

type EmptyBlockProps = {
  icon: React.ElementType;
  title: string;
  text: string;
};

const EmptyBlock: React.FC<EmptyBlockProps> = ({
  icon: Icon,
  title,
  text,
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Icon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
      </div>

      <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {text}
      </p>
    </div>
  );
};

/* ============================================================
   INDICATEUR HORS LIGNE
============================================================ */

const OfflineIndicator: React.FC = () => {
  return (
    <div className="pointer-events-none fixed bottom-3 left-1/2 z-[100] -translate-x-1/2">
      <div className="rounded-full border border-slate-700 bg-slate-950/90 px-4 py-2 text-xs font-bold text-slate-300 shadow-2xl backdrop-blur-sm">
        Mode hors ligne · données disponibles sur cet appareil
      </div>
    </div>
  );
};

/* ============================================================
   DATE DES DEMANDES
============================================================ */

const formatRequestDate = (
  value?: string | null
) => {
  if (!value) {
    return "date inconnue";
  }

  try {
    return new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
};

export default Directeur;