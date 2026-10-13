import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

import {
  School,
  UserCheck,
  X,
  CheckCircle2,
  Loader2,
  UserMinus,
  Users,
  GraduationCap,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Building2,
  Clock3,
  UserPlus,
  Ban,
  RefreshCcw,
  FileText,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  Eye,
} from "lucide-react";


// ==========================================================
// DOCUMENT ATTRIBUÉ
// ==========================================================

interface DocumentAttribue {
  id: number;
  document_name: string;
  activation_code: string;
  is_activated: boolean;
  activated_at?: string | null;
  activation_type?: string | null;
}


// ==========================================================
// DIRECTION D'ÉCOLE
// ==========================================================

interface Directorship {
  id?: number;
  school_id: number;
  school_name: string;
  is_active: boolean;
}


// ==========================================================
// RÉPONSE ÉCOLES DU DIRECTEUR
// ==========================================================

interface DirectorSchoolResponse {
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
  is_active?: boolean;
}


// ==========================================================
// ÉCOLE
// ==========================================================

interface SchoolItem {
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
  is_active?: boolean;
}


// ==========================================================
// ÉCOLE D'UN UTILISATEUR
// ==========================================================

interface UserSchoolMembership {
  membership_id?: number;
  school_id: number;
  school_name?: string;
  nom?: string;
  role?: "teacher" | "student" | "director" | string;
  status?: "pending" | "approved" | "rejected" | string;
  academic_year?: string | null;
  is_director?: boolean;
  is_teacher?: boolean;
}


// ==========================================================
// ENSEIGNANT D'UNE ÉCOLE
// ==========================================================

interface SchoolTeacher {
  user_id: number;
  school_id: number;
  school_name?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  is_active?: boolean;
  enseignant?: boolean;
  enseignant_actif?: boolean;
}


// ==========================================================
// UTILISATEUR INSCRIT
// ==========================================================

interface UserInscrit {
  id: number;

  nom: string;
  prenom: string;

  email: string;
  telephone: string;

  date_inscription: string;

  is_validated: boolean;

  is_blocked?: boolean;

  status?: "pending" | "validated" | "refused";

  last_warning?: string;

  is_online?: boolean;

  is_admin?: boolean;

  is_active?: boolean;

  enseignant?: boolean;

  enseignant_actif?: boolean;

  subjects?: string[];

  directorships?: Directorship[];

  school_memberships?: UserSchoolMembership[];

  schools?: UserSchoolMembership[];

  ecoles?: UserSchoolMembership[];

  parrain_email: string;

  lieu_naissance?: string;

  filleuls_emails?: string[];

  documents?: DocumentAttribue[];
}


// ==========================================================
// CONFIGURATION
// ==========================================================

const PAGE_SIZE = 10;


// ==========================================================
// COMPOSANT
// ==========================================================

const ListeInscrits: React.FC = () => {

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const navigate = useNavigate();


  // ========================================================
  // ÉTATS
  // ========================================================

  const [
    inscrits,
    setInscrits,
  ] = useState<UserInscrit[]>([]);

  const [
    loadingListe,
    setLoadingListe,
  ] = useState(false);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    totalInscrits,
    setTotalInscrits,
  ] = useState(0);


  // ========================================================
  // RECHERCHE / FILTRE VISUEL
  // ========================================================

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  // ========================================================
  // ACCÈS DIRECTEUR
  // ========================================================

  const [
    isDirector,
    setIsDirector,
  ] = useState(false);

  const [
    accessChecking,
    setAccessChecking,
  ] = useState(true);


  // ========================================================
  // ÉCOLES DU DIRECTEUR
  // ========================================================

  const [
    directorSchools,
    setDirectorSchools,
  ] = useState<Directorship[]>([]);


  // ========================================================
  // ENSEIGNANTS DES ÉCOLES DU DIRECTEUR
  // ========================================================

  const [
    directorTeachers,
    setDirectorTeachers,
  ] = useState<SchoolTeacher[]>([]);

  const [
    directorTeachersLoading,
    setDirectorTeachersLoading,
  ] = useState(false);

  const [
    teacherRemoving,
    setTeacherRemoving,
  ] = useState<{
    userId: number;
    schoolId: number;
  } | null>(null);


  // ========================================================
  // GESTION DIRECTEURS
  // ========================================================

  const [
    schools,
    setSchools,
  ] = useState<SchoolItem[]>([]);

  const [
    schoolsLoading,
    setSchoolsLoading,
  ] = useState(false);

  const [
    directorModalOpen,
    setDirectorModalOpen,
  ] = useState(false);

  const [
    selectedDirector,
    setSelectedDirector,
  ] = useState<UserInscrit | null>(null);

  const [
    selectedSchoolId,
    setSelectedSchoolId,
  ] = useState<number | "">("");

  const [
    directorSaving,
    setDirectorSaving,
  ] = useState(false);

  const [
    directorRemoving,
    setDirectorRemoving,
  ] = useState<number | null>(null);


  // ========================================================
  // VÉRIFICATION ADMIN / DIRECTEUR
  // ========================================================

  useEffect(() => {

    if (authLoading) {
      return;
    }


    if (!user) {

      navigate("/login");

      return;

    }


    if (user.is_admin) {

      setIsDirector(false);
      setDirectorSchools([]);
      setAccessChecking(false);

      return;

    }


    const checkDirectorAccess =
      async () => {

        setAccessChecking(true);

        try {

          const response =
            await api.get(
              "/api/schools/director/my-schools"
            );


          const data =
            response.data || {};


          const rawSchools:
            DirectorSchoolResponse[] =
            Array.isArray(data)
              ? data
              : Array.isArray(data.schools)
                ? data.schools
                : [];


          const activeSchools:
            Directorship[] =
            rawSchools
              .filter(
                (
                  school
                ) =>
                  school.is_active !== false
              )
              .map(
                (
                  school:
                    DirectorSchoolResponse
                ): Directorship => ({

                  id:
                    school.id,

                  school_id:
                    school.id,

                  school_name:
                    school.nom,

                  is_active:
                    true,

                })
              );


          if (
            activeSchools.length > 0
          ) {

            setDirectorSchools(
              activeSchools
            );

            setIsDirector(true);

          } else {

            setDirectorSchools([]);

            setIsDirector(false);

            navigate("/page2");

          }

        } catch (err: any) {

          console.error(
            "Erreur vérification directeur :",
            err
          );

          setDirectorSchools([]);
          setIsDirector(false);

          navigate("/page2");

        } finally {

          setAccessChecking(false);

        }

      };


    void checkDirectorAccess();

  }, [
    authLoading,
    user,
    navigate,
  ]);


  // ========================================================
  // RÉCUPÉRATION DES ENSEIGNANTS
  // ========================================================

  const fetchDirectorTeachers =
    async (
      schoolList:
        Directorship[]
    ) => {

      if (
        schoolList.length ===
        0
      ) {

        setDirectorTeachers([]);

        return;

      }


      setDirectorTeachersLoading(
        true
      );


      try {

        const responses =
          await Promise.all(
            schoolList.map(
              async (
                school
              ) => {

                try {

                  const response =
                    await api.get(
                      `/api/schools/director/${school.school_id}/teachers`
                    );


                  const data =
                    response.data;


                  const teachers =
                    Array.isArray(data)
                      ? data
                      : Array.isArray(
                          data?.teachers
                        )
                        ? data.teachers
                        : [];


                  return teachers.map(
                    (
                      teacher: any
                    ): SchoolTeacher => ({

                      user_id:
                        Number(
                          teacher.user_id ??
                          teacher.id
                        ),

                      school_id:
                        school.school_id,

                      school_name:
                        teacher.school_name ??
                        school.school_name,

                      nom:
                        teacher.nom,

                      prenom:
                        teacher.prenom,

                      email:
                        teacher.email,

                      telephone:
                        teacher.telephone,

                      enseignant:
                        teacher.enseignant !==
                        undefined
                          ? Boolean(
                              teacher.enseignant
                            )
                          : true,

                      enseignant_actif:
                        teacher.enseignant_actif !==
                        undefined
                          ? Boolean(
                              teacher.enseignant_actif
                            )
                          : true,

                      is_active:
                        teacher.enseignant_actif !==
                          false &&
                        teacher.is_active !==
                          false,

                    })

                  );

                } catch (err) {

                  console.error(
                    `Erreur enseignants école ${school.school_id} :`,
                    err
                  );

                  return [];

                }

              }
            )
          );


        const merged:
          SchoolTeacher[] =
          responses.flat();


        const unique =
          merged.filter(
            (
              teacher,
              index,
              array
            ) =>
              index ===
              array.findIndex(
                (
                  item
                ) =>
                  item.user_id ===
                    teacher.user_id &&
                  item.school_id ===
                    teacher.school_id
              )
          );


        setDirectorTeachers(
          unique
        );


      } catch (err) {

        console.error(
          "Erreur récupération enseignants directeur :",
          err
        );

        setDirectorTeachers([]);

      } finally {

        setDirectorTeachersLoading(
          false
        );

      }

    };


  // ========================================================
  // RECHERCHE DES ÉCOLES D'UN ENSEIGNANT
  // ========================================================

  const getTeacherSchools =
    (
      userId:
        number
    ): SchoolTeacher[] => {

      return directorTeachers.filter(
        (
          teacher
        ) =>
          teacher.user_id ===
            userId &&
          teacher.is_active !==
            false
      );

    };


  // ========================================================
  // RÉCUPÉRATION DES ÉCOLES
  // ========================================================

  const fetchSchools =
    async () => {

      setSchoolsLoading(true);

      try {

        const response =
          await api.get(
            "/api/schools"
          );


        const data =
          response.data;


        if (
          Array.isArray(data)
        ) {

          setSchools(data);

        } else {

          setSchools(
            data?.schools || []
          );

        }

      } catch (err) {

        console.error(
          "Erreur récupération écoles :",
          err
        );

        alert(
          "Impossible de récupérer la liste des écoles."
        );

      } finally {

        setSchoolsLoading(false);

      }

    };


  // ========================================================
  // OUVRIR LA FENÊTRE DIRECTEUR
  // ========================================================

  const handleOpenDirectorModal =
    (
      utilisateur:
        UserInscrit
    ) => {

      setSelectedDirector(
        utilisateur
      );

      setSelectedSchoolId("");

      setDirectorModalOpen(true);

      void fetchSchools();

    };


  // ========================================================
  // FERMER LA FENÊTRE DIRECTEUR
  // ========================================================

  const handleCloseDirectorModal =
    () => {

      if (
        directorSaving
      ) {

        return;

      }


      setDirectorModalOpen(false);

      setSelectedDirector(null);

      setSelectedSchoolId("");

    };


  // ========================================================
  // DÉSIGNER UN DIRECTEUR
  // ========================================================

  const handleDesignateDirector =
    async () => {

      if (
        !selectedDirector
      ) {

        return;

      }


      if (
        !selectedSchoolId
      ) {

        alert(
          "Veuillez sélectionner une école."
        );

        return;

      }


      const school =
        schools.find(
          (
            item
          ) =>
            item.id ===
            Number(
              selectedSchoolId
            )
        );


      if (!school) {

        alert(
          "École sélectionnée introuvable."
        );

        return;

      }


      const alreadyDirector =
        (
          selectedDirector.directorships ||
          []
        ).some(
          (
            direction
          ) =>
            direction.school_id ===
              Number(
                selectedSchoolId
              ) &&
            direction.is_active
        );


      if (
        alreadyDirector
      ) {

        alert(
          "Cette personne est déjà directeur de cette école."
        );

        return;

      }


      const confirmation =
        window.confirm(
          `Voulez-vous désigner ${selectedDirector.prenom} ${selectedDirector.nom} comme directeur de "${school.nom}" ?`
        );


      if (!confirmation) {
        return;
      }


      setDirectorSaving(true);


      try {

        const response =
          await api.post(
            `/api/schools/admin/${selectedSchoolId}/director`,
            {
              user_id:
                selectedDirector.id,
            }
          );


        setInscrits(
          (
            prev
          ) =>
            prev.map(
              (
                item
              ) => {

                if (
                  item.id !==
                  selectedDirector.id
                ) {

                  return item;

                }


                const anciennesDirections =
                  Array.isArray(
                    item.directorships
                  )
                    ? item.directorships
                    : [];


                const directionExistante =
                  anciennesDirections.find(
                    (
                      direction
                    ) =>
                      direction.school_id ===
                      Number(
                        selectedSchoolId
                      )
                  );


                let nouvellesDirections:
                  Directorship[];


                if (
                  directionExistante
                ) {

                  nouvellesDirections =
                    anciennesDirections.map(
                      (
                        direction
                      ) =>
                        direction.school_id ===
                        Number(
                          selectedSchoolId
                        )
                          ? {
                              ...direction,
                              school_name:
                                school.nom,
                              is_active:
                                true,
                            }
                          : direction
                    );

                } else {

                  nouvellesDirections =
                    [
                      ...anciennesDirections,
                      {
                        school_id:
                          Number(
                            selectedSchoolId
                          ),

                        school_name:
                          school.nom,

                        is_active:
                          true,

                      },
                    ];

                }


                const anciennesEcoles =
                  Array.isArray(
                    item.school_memberships
                  )
                    ? item.school_memberships
                    : [];


                const membershipExistante =
                  anciennesEcoles.find(
                    (
                      membership
                    ) =>
                      membership.school_id ===
                        Number(
                          selectedSchoolId
                        ) &&
                      membership.role ===
                        "teacher"
                  );


                let nouvellesEcoles:
                  UserSchoolMembership[];


                if (
                  membershipExistante
                ) {

                  nouvellesEcoles =
                    anciennesEcoles.map(
                      (
                        membership
                      ) =>
                        membership.school_id ===
                          Number(
                            selectedSchoolId
                          ) &&
                        membership.role ===
                          "teacher"
                          ? {
                              ...membership,
                              school_name:
                                school.nom,
                              nom:
                                school.nom,
                              status:
                                "approved",
                              is_teacher:
                                true,
                              is_director:
                                true,
                            }
                          : membership
                    );

                } else {

                  nouvellesEcoles =
                    [
                      ...anciennesEcoles,
                      {
                        school_id:
                          Number(
                            selectedSchoolId
                          ),

                        school_name:
                          school.nom,

                        nom:
                          school.nom,

                        role:
                          "teacher",

                        status:
                          "approved",

                        is_teacher:
                          true,

                        is_director:
                          true,

                      },
                    ];

                }


                return {
                  ...item,

                  directorships:
                    nouvellesDirections,

                  school_memberships:
                    nouvellesEcoles,

                  enseignant:
                    true,

                  enseignant_actif:
                    true,

                };

              }
            )
        );


        alert(
          response.data?.message ||
          `${selectedDirector.prenom} ${selectedDirector.nom} est maintenant directeur de ${school.nom}.`
        );


        handleCloseDirectorModal();


      } catch (
        err: any
      ) {

        console.error(
          "Erreur désignation directeur :",
          err
        );


        if (
          err?.response?.status ===
          400
        ) {

          alert(
            err.response.data?.detail ||
            "Impossible de désigner ce directeur."
          );

        } else if (
          err?.response?.status ===
          401
        ) {

          alert(
            "Votre session a expiré. Veuillez vous reconnecter."
          );

        } else if (
          err?.response?.status ===
          403
        ) {

          alert(
            "Vous n'avez pas les droits administrateur nécessaires."
          );

        } else if (
          err?.response?.status ===
          404
        ) {

          alert(
            "Utilisateur ou école introuvable."
          );

        } else {

          alert(
            err?.response?.data?.detail ||
            "Erreur lors de la désignation du directeur."
          );

        }

      } finally {

        setDirectorSaving(false);

      }

    };


  // ========================================================
  // RETIRER UN DIRECTEUR
  // ========================================================

  const handleRemoveDirector =
    async (
      utilisateur:
        UserInscrit,
      schoolId:
        number
    ) => {

      const direction =
        (
          utilisateur.directorships ||
          []
        ).find(
          (
            item
          ) =>
            item.school_id ===
              schoolId &&
            item.is_active
        );


      if (!direction) {
        return;
      }


      const confirmation =
        window.confirm(
          `Voulez-vous retirer ${utilisateur.prenom} ${utilisateur.nom} de la direction de "${direction.school_name}" ?`
        );


      if (!confirmation) {
        return;
      }


      setDirectorRemoving(
        schoolId
      );


      try {

        await api.delete(
          `/api/schools/admin/${schoolId}/director`
        );


        setInscrits(
          (
            prev
          ) =>
            prev.map(
              (
                item
              ) => {

                if (
                  item.id !==
                  utilisateur.id
                ) {

                  return item;

                }


                return {
                  ...item,

                  directorships:
                    (
                      item.directorships ||
                      []
                    ).map(
                      (
                        directionItem
                      ) =>
                        directionItem.school_id ===
                        schoolId
                          ? {
                              ...directionItem,
                              is_active:
                                false,
                            }
                          : directionItem
                    ),

                };

              }
            )
        );


        alert(
          "Le statut de directeur a été retiré."
        );


      } catch (
        err: any
      ) {

        console.error(
          "Erreur retrait directeur :",
          err
        );


        if (
          err?.response?.status ===
          403
        ) {

          alert(
            "Vous n'avez pas les droits administrateur nécessaires."
          );

        } else if (
          err?.response?.status ===
          404
        ) {

          alert(
            "Direction introuvable."
          );

        } else {

          alert(
            err?.response?.data?.detail ||
            "Erreur lors du retrait du directeur."
          );

        }

      } finally {

        setDirectorRemoving(
          null
        );

      }

    };


  // ========================================================
  // RETIRER UN ENSEIGNANT DE L'ÉCOLE
  // ========================================================

  const handleRemoveTeacherFromSchool =
    async (
      utilisateur:
        UserInscrit,
      schoolId:
        number,
      schoolName:
        string
    ) => {

      if (
        !isDirector ||
        user?.is_admin
      ) {

        return;

      }


      const confirmation =
        window.confirm(
          `Voulez-vous retirer ${utilisateur.prenom} ${utilisateur.nom} de l'école "${schoolName}" en tant qu'enseignant ?`
        );


      if (!confirmation) {
        return;
      }


      setTeacherRemoving({
        userId:
          utilisateur.id,

        schoolId,
      });


      try {

        const response =
          await api.delete(
            `/api/schools/director/${schoolId}/teachers/${utilisateur.id}`
          );


        setDirectorTeachers(
          (
            prev
          ) =>
            prev.filter(
              (
                teacher
              ) =>
                !(
                  teacher.user_id ===
                    utilisateur.id &&
                  teacher.school_id ===
                    schoolId
                )
            )
        );


        const removeSchoolMembership =
          (
            membership:
              UserSchoolMembership
          ) =>
            !(
              membership.school_id ===
                schoolId &&
              membership.role ===
                "teacher"
            );


        setInscrits(
          (
            prev
          ) =>
            prev.map(
              (
                item
              ) => {

                if (
                  item.id !==
                  utilisateur.id
                ) {

                  return item;

                }


                return {
                  ...item,

                  school_memberships:
                    (
                      item.school_memberships ||
                      []
                    ).filter(
                      removeSchoolMembership
                    ),

                  schools:
                    (
                      item.schools ||
                      []
                    ).filter(
                      removeSchoolMembership
                    ),

                  ecoles:
                    (
                      item.ecoles ||
                      []
                    ).filter(
                      removeSchoolMembership
                    ),

                };

              }
            )
        );


        alert(
          response.data?.message ||
          `${utilisateur.prenom} ${utilisateur.nom} a été retiré de l'école ${schoolName}.`
        );


      } catch (
        err: any
      ) {

        console.error(
          "Erreur retrait enseignant de l'école :",
          err
        );


        if (
          err?.response?.status ===
          400
        ) {

          alert(
            err.response.data?.detail ||
            "Impossible de retirer cet enseignant."
          );

        } else if (
          err?.response?.status ===
          401
        ) {

          alert(
            "Votre session a expiré. Veuillez vous reconnecter."
          );

        } else if (
          err?.response?.status ===
          403
        ) {

          alert(
            "Vous n'avez pas les droits de direction sur cette école."
          );

        } else if (
          err?.response?.status ===
          404
        ) {

          alert(
            "Enseignant ou école introuvable."
          );

        } else {

          alert(
            err?.response?.data?.detail ||
            "Erreur lors du retrait de l'enseignant."
          );

        }

      } finally {

        setTeacherRemoving(
          null
        );

      }

    };


  // ========================================================
  // UTILITAIRE NORMALISATION UTILISATEUR
  // ========================================================

  const normalizeUser =
    (
      raw:
        any
    ): UserInscrit => {

      const normalized:
        UserInscrit = {

          id:
            Number(
              raw.id ??
              raw.user_id
            ),

          nom:
            raw.nom ||
            "",

          prenom:
            raw.prenom ||
            "",

          email:
            raw.email ||
            "",

          telephone:
            raw.telephone ||
            "",

          date_inscription:
            raw.date_inscription ||
            raw.created_at ||
            "",

          is_validated:
            Boolean(
              raw.is_validated
            ),

          is_blocked:
            Boolean(
              raw.is_blocked
            ),

          status:
            raw.is_validated
              ? "validated"
              : raw.status ===
                "SUSPENDED"
              ? "refused"
              : raw.status ===
                "refused"
              ? "refused"
              : "pending",

          last_warning:
            raw.last_warning,

          is_online:
            raw.is_online,

          is_admin:
            raw.is_admin,

          is_active:
            raw.is_active,

          enseignant:
            raw.enseignant !==
            undefined
              ? Boolean(
                  raw.enseignant
                )
              : undefined,

          enseignant_actif:
            raw.enseignant_actif !==
            undefined
              ? Boolean(
                  raw.enseignant_actif
                )
              : undefined,

          subjects:
            Array.isArray(
              raw.subjects
            )
              ? raw.subjects
              : [],

          directorships:
            Array.isArray(
              raw.directorships
            )
              ? raw.directorships
              : [],

          school_memberships:
            Array.isArray(
              raw.school_memberships
            )
              ? raw.school_memberships
              : [],

          schools:
            Array.isArray(
              raw.schools
            )
              ? raw.schools
              : [],

          ecoles:
            Array.isArray(
              raw.ecoles
            )
              ? raw.ecoles
              : [],

          parrain_email:
            raw.parrain_email ||
            "",

          lieu_naissance:
            raw.lieu_naissance,

          filleuls_emails:
            Array.isArray(
              raw.filleuls_emails
            )
              ? raw.filleuls_emails
              : [],

          documents:
            Array.isArray(
              raw.documents
            )
              ? raw.documents
              : [],

        };


      return normalized;

    };


  // ========================================================
  // AJOUT ASSOCIATION ÉCOLE
  // ========================================================

  const addSchoolMembershipToUser =
    (
      userItem:
        UserInscrit,
      membership:
        UserSchoolMembership
    ): UserInscrit => {

      const current =
        Array.isArray(
          userItem.school_memberships
        )
          ? userItem.school_memberships
          : [];


      const exists =
        current.some(
          (
            item
          ) =>
            item.school_id ===
              membership.school_id &&
            item.role ===
              membership.role
        );


      if (exists) {
        return userItem;
      }


      return {
        ...userItem,

        school_memberships:
          [
            ...current,
            membership,
          ],

      };

    };


  // ========================================================
  // RÉCUPÉRATION DES UTILISATEURS D'UNE ÉCOLE
  // ========================================================

  const fetchDirectorSchoolUsers =
    async (
      schoolList:
        Directorship[]
    ): Promise<UserInscrit[]> => {

      if (
        schoolList.length ===
        0
      ) {

        return [];

      }


      const schoolResponses =
        await Promise.all(
          schoolList.map(
            async (
              school
            ) => {

              const users:
                UserInscrit[] = [];


              // ------------------------------------------------
              // ENSEIGNANTS
              // ------------------------------------------------

              try {

                const teacherResponse =
                  await api.get(
                    `/api/schools/director/${school.school_id}/teachers`
                  );


                const teacherData =
                  teacherResponse.data;


                const teachers =
                  Array.isArray(
                    teacherData
                  )
                    ? teacherData
                    : Array.isArray(
                        teacherData?.teachers
                      )
                      ? teacherData.teachers
                      : [];


                teachers.forEach(
                  (
                    rawTeacher:
                      any
                  ) => {

                    const teacher =
                      normalizeUser(
                        rawTeacher
                      );


                    teacher.enseignant =
                      true;

                    teacher.enseignant_actif =
                      rawTeacher.enseignant_actif !==
                      undefined
                        ? Boolean(
                            rawTeacher.enseignant_actif
                          )
                        : true;


                    const membership:
                      UserSchoolMembership = {

                        school_id:
                          school.school_id,

                        school_name:
                          rawTeacher.school_name ||
                          school.school_name,

                        nom:
                          rawTeacher.school_name ||
                          school.school_name,

                        role:
                          "teacher",

                        status:
                          "approved",

                        is_teacher:
                          true,

                      };


                    teacher.school_memberships =
                      [
                        ...(
                          teacher.school_memberships ||
                          []
                        ),
                        membership,
                      ];


                    users.push(
                      teacher
                    );

                  }
                );

              } catch (
                err
              ) {

                console.error(
                  `Erreur récupération enseignants école ${school.school_id} :`,
                  err
                );

              }


              // ------------------------------------------------
              // APPRENANTS
              // ------------------------------------------------

              try {

                const studentResponse =
                  await api.get(
                    `/api/schools/director/${school.school_id}/students`
                  );


                const studentData =
                  studentResponse.data;


                const students =
                  Array.isArray(
                    studentData
                  )
                    ? studentData
                    : Array.isArray(
                        studentData?.students
                      )
                      ? studentData.students
                      : [];


                students.forEach(
                  (
                    rawStudent:
                      any
                  ) => {

                    const student =
                      normalizeUser(
                        rawStudent
                      );


                    const membership:
                      UserSchoolMembership = {

                        school_id:
                          school.school_id,

                        school_name:
                          rawStudent.school_name ||
                          school.school_name,

                        nom:
                          rawStudent.school_name ||
                          school.school_name,

                        role:
                          "student",

                        status:
                          rawStudent.membership_status ||
                          "approved",

                        academic_year:
                          rawStudent.academic_year ||
                          null,

                        is_teacher:
                          false,

                      };


                    student.school_memberships =
                      [
                        ...(
                          student.school_memberships ||
                          []
                        ),
                        membership,
                      ];


                    users.push(
                      student
                    );

                  }
                );

              } catch (
                err
              ) {

                console.error(
                  `Erreur récupération apprenants école ${school.school_id} :`,
                  err
                );

              }


              return users;

            }
          )
        );


      const merged =
        schoolResponses.flat();


      const usersMap =
        new Map<
          number,
          UserInscrit
        >();


      merged.forEach(
        (
          current
        ) => {

          if (
            !current.id
          ) {

            return;

          }


          const existing =
            usersMap.get(
              current.id
            );


          if (!existing) {

            usersMap.set(
              current.id,
              current
            );

            return;

          }


          const existingMemberships =
            Array.isArray(
              existing.school_memberships
            )
              ? existing.school_memberships
              : [];


          const currentMemberships =
            Array.isArray(
              current.school_memberships
            )
              ? current.school_memberships
              : [];


          const mergedMemberships =
            [
              ...existingMemberships,
            ];


          currentMemberships.forEach(
            (
              membership
            ) => {

              const exists =
                mergedMemberships.some(
                  (
                    item
                  ) =>
                    item.school_id ===
                      membership.school_id &&
                    item.role ===
                      membership.role
                );


              if (!exists) {

                mergedMemberships.push(
                  membership
                );

              }

            }
          );


          usersMap.set(
            current.id,
            {
              ...existing,

              enseignant:
                existing.enseignant ===
                  true ||
                current.enseignant ===
                  true,

              enseignant_actif:
                existing.enseignant_actif ===
                    false &&
                  current.enseignant_actif !==
                    true
                  ? false
                  : current.enseignant_actif !==
                      undefined
                    ? current.enseignant_actif
                    : existing.enseignant_actif,

              school_memberships:
                mergedMemberships,

              schools:
                mergedMemberships,

              ecoles:
                mergedMemberships,

            }
          );

        }
      );


      return Array.from(
        usersMap.values()
      );

    };


  // ========================================================
  // RÉCUPÉRATION DES INSCRITS
  // ========================================================

  useEffect(() => {

    if (
      authLoading ||
      accessChecking
    ) {

      return;

    }


    if (
      !user?.is_admin &&
      !isDirector
    ) {

      return;

    }


    const fetchInscrits =
      async () => {

        setLoadingListe(
          true
        );


        try {

          // ==================================================
          // ADMIN CODE
          // ==================================================

          if (
            user?.is_admin
          ) {

            const response =
              await api.get(
                "/api/admin/liste-inscrits",
                {
                  params: {
                    page,
                    page_size:
                      PAGE_SIZE,
                  },
                }
              );


            const nouvelleListe:
              UserInscrit[] =
              (
                response.data.inscrits ||
                []
              )
                .filter(
                  (
                    i: any
                  ) =>
                    i.email !==
                    "deogratiashounsou@gmail.com"
                )
                .map(
                  (
                    i: any
                  ) =>
                    normalizeUser(
                      i
                    )
                );


            const listeTriee =
              [
                ...nouvelleListe,
              ].sort(
                (
                  a,
                  b
                ) => {

                  const nombreDocumentsA =
                    Array.isArray(
                      a.documents
                    )
                      ? a.documents.length
                      : 0;


                  const nombreDocumentsB =
                    Array.isArray(
                      b.documents
                    )
                      ? b.documents.length
                      : 0;


                  if (
                    nombreDocumentsA >
                      0 &&
                    nombreDocumentsB ===
                      0
                  ) {

                    return -1;

                  }


                  if (
                    nombreDocumentsA ===
                      0 &&
                    nombreDocumentsB >
                      0
                  ) {

                    return 1;

                  }


                  if (
                    nombreDocumentsA >
                      0 &&
                    nombreDocumentsB >
                      0 &&
                    nombreDocumentsA !==
                      nombreDocumentsB
                  ) {

                    return (
                      nombreDocumentsB -
                      nombreDocumentsA
                    );

                  }


                  return 0;

                }
              );


            setInscrits(
              listeTriee
            );


            const total =
              Number(
                response.data.total
              ) || 0;


            setTotalInscrits(
              total
            );


            return;

          }


          // ==================================================
          // DIRECTEUR
          // ==================================================

          if (
            isDirector &&
            directorSchools.length >
              0
          ) {

            const allUsers =
              await fetchDirectorSchoolUsers(
                directorSchools
              );


            const filteredUsers =
              allUsers.filter(
                (
                  item
                ) =>
                  !item.is_admin
              );


            const listeTriee =
              [
                ...filteredUsers,
              ].sort(
                (
                  a,
                  b
                ) => {

                  const aTeacher =
                    a.enseignant ===
                    true
                      ? 0
                      : 1;


                  const bTeacher =
                    b.enseignant ===
                    true
                      ? 0
                      : 1;


                  if (
                    aTeacher !==
                    bTeacher
                  ) {

                    return (
                      aTeacher -
                      bTeacher
                    );

                  }


                  const nomCompare =
                    a.nom.localeCompare(
                      b.nom,
                      "fr",
                      {
                        sensitivity:
                          "base",
                      }
                    );


                  if (
                    nomCompare !==
                    0
                  ) {

                    return nomCompare;

                  }


                  return a.prenom.localeCompare(
                    b.prenom,
                    "fr",
                    {
                      sensitivity:
                        "base",
                    }
                  );

                }
              );


            const total =
              listeTriee.length;


            setTotalInscrits(
              total
            );


            const start =
              (
                page -
                1
              ) *
              PAGE_SIZE;


            const end =
              start +
              PAGE_SIZE;


            setInscrits(
              listeTriee.slice(
                start,
                end
              )
            );


            const calculatedPages =
              Math.max(
                1,
                Math.ceil(
                  total /
                  PAGE_SIZE
                )
              );


            if (
              page >
                calculatedPages
            ) {

              setPage(
                calculatedPages
              );

            }


            return;

          }


          setInscrits([]);
          setTotalInscrits(0);

        } catch (
          err: any
        ) {

          console.error(
            "Erreur récupération inscrits :",
            err
          );


          if (
            err?.response?.status ===
            403
          ) {

            alert(
              "Vous n'avez pas accès à cette liste."
            );

            navigate(
              "/page2"
            );

          }

        } finally {

          setLoadingListe(
            false
          );

        }

      };


    void fetchInscrits();

  }, [
    page,
    user,
    authLoading,
    accessChecking,
    isDirector,
    directorSchools,
    navigate,
  ]);


  // ========================================================
  // RÉCUPÉRATION ENSEIGNANTS DIRECTEUR
  // ========================================================

  useEffect(() => {

    if (
      !isDirector ||
      user?.is_admin
    ) {

      return;

    }


    if (
      directorSchools.length ===
      0
    ) {

      setDirectorTeachers([]);

      return;

    }


    void fetchDirectorTeachers(
      directorSchools
    );

  }, [
    isDirector,
    user,
    directorSchools,
  ]);


  // ========================================================
  // NOMBRE TOTAL DE PAGES
  // ========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalInscrits /
        PAGE_SIZE
      )
    );


  // ========================================================
  // PAGES VISIBLES
  // ========================================================

  const visiblePages =
    useMemo(
      () => {

        if (
          totalPages <=
          7
        ) {

          return Array.from(
            {
              length:
                totalPages,
            },
            (
              _,
              index
            ) =>
              index + 1
          );

        }


        const pages:
          number[] =
          [];


        pages.push(1);


        for (
          let p =
            Math.max(
              2,
              page - 2
            );

          p <=
          Math.min(
            totalPages - 1,
            page + 2
          );

          p++
        ) {

          pages.push(p);

        }


        pages.push(
          totalPages
        );


        return Array.from(
          new Set(
            pages
          )
        );

      },
      [
        page,
        totalPages,
      ]
    );


  // ========================================================
  // INDEX PAGINATION
  // ========================================================

  const startIndex =
    totalInscrits ===
    0
      ? 0
      : (
          page -
          1
        ) *
          PAGE_SIZE +
        1;


  const endIndex =
    Math.min(
      page *
        PAGE_SIZE,
      totalInscrits
    );


  // ========================================================
  // ÉCOLES D'UN UTILISATEUR
  // ========================================================

  const getUserSchools =
    (
      utilisateur:
        UserInscrit
    ): UserSchoolMembership[] => {

      const result:
        UserSchoolMembership[] =
        [];


      const sources = [
        ...(Array.isArray(
          utilisateur.school_memberships
        )
          ? utilisateur.school_memberships
          : []),

        ...(Array.isArray(
          utilisateur.schools
        )
          ? utilisateur.schools
          : []),

        ...(Array.isArray(
          utilisateur.ecoles
        )
          ? utilisateur.ecoles
          : []),
      ];


      sources.forEach(
        (
          school
        ) => {

          const schoolId =
            Number(
              school.school_id
            );


          if (
            !schoolId ||
            result.some(
              (
                item
              ) =>
                item.school_id ===
                  schoolId &&
                item.role ===
                  school.role
            )
          ) {

            return;

          }


          result.push({
            ...school,

            school_id:
              schoolId,

            school_name:
              school.school_name ||
              school.nom ||
              `École #${schoolId}`,

          });

        }
      );


      (
        utilisateur.directorships ||
        []
      )
        .filter(
          (
            direction
          ) =>
            direction.is_active
        )
        .forEach(
          (
            direction
          ) => {

            if (
              !result.some(
                (
                  item
                ) =>
                  item.school_id ===
                    direction.school_id &&
                  item.role ===
                    "director"
              )
            ) {

              result.push({
                school_id:
                  direction.school_id,

                school_name:
                  direction.school_name,

                role:
                  "director",

                is_director:
                  true,

              });

            }

          }
        );


      return result;

    };


  // ========================================================
  // AFFICHAGE DES ÉCOLES
  // ========================================================

  const renderUserSchools =
    (
      utilisateur:
        UserInscrit
    ) => {

      const userSchools =
        getUserSchools(
          utilisateur
        );


      if (
        userSchools.length ===
        0
      ) {

        return (
          <span
            className="
              text-gray-400
              dark:text-gray-500
              italic
              text-sm
            "
          >
            Aucune école
          </span>
        );

      }


      return (

        <div
          className="
            flex
            flex-col
            gap-2
            min-w-[230px]
          "
        >

          {userSchools.map(
            (
              school,
              index
            ) => {

              const role =
                school.is_director ||
                school.role ===
                  "director"
                  ? "Directeur"
                  : school.is_teacher ||
                    school.role ===
                      "teacher"
                  ? "Enseignant"
                  : "Apprenant";


              return (

                <div
                  key={
                    `${school.school_id}-${school.role}-${index}`
                  }
                  className="
                    rounded-xl
                    bg-blue-50
                    dark:bg-blue-900/20
                    border
                    border-blue-100
                    dark:border-blue-800
                    p-3
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      font-semibold
                      text-blue-700
                      dark:text-blue-300
                      text-sm
                    "
                  >

                    <Building2
                      size={15}
                    />

                    <span>
                      {
                        school.school_name
                      }
                    </span>

                  </div>


                  <div
                    className="
                      text-xs
                      text-gray-600
                      dark:text-gray-300
                      mt-1
                    "
                  >

                    {role}

                    {school.academic_year
                      ? ` • ${school.academic_year}`
                      : ""}

                    {school.status
                      ? ` • ${school.status}`
                      : ""}

                  </div>

                </div>

              );

            }
          )}

        </div>

      );

    };


  // ========================================================
  // PROF POUR UN DIRECTEUR
  // ========================================================

  const getTeacherSchoolsForDirector =
    (
      userId:
        number
    ) => {

      return getTeacherSchools(
        userId
      );

    };


  // ========================================================
  // NOMBRE INSCRIPTIONS EN ATTENTE
  // ========================================================

  const pendingCount =
    inscrits.filter(
      (
        i
      ) =>
        i.status ===
        "pending"
    ).length;


  // ========================================================
  // STATISTIQUES VISUELLES
  // ========================================================

  const onlineCount =
    inscrits.filter(
      (
        i
      ) =>
        i.is_online
    ).length;


  const teacherCount =
    inscrits.filter(
      (
        i
      ) =>
        i.enseignant
    ).length;


  const blockedCount =
    inscrits.filter(
      (
        i
      ) =>
        i.is_blocked
    ).length;


  const documentsCount =
    inscrits.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          Array.isArray(
            item.documents
          )
            ? item.documents.length
            : 0
        ),
      0
    );


  // ========================================================
  // FILTRE VISUEL
  // ========================================================

  const displayedInscrits =
    useMemo(
      () => {

        const term =
          searchTerm
            .trim()
            .toLowerCase();


        if (!term) {
          return inscrits;
        }


        return inscrits.filter(
          (
            item
          ) =>
            `${item.prenom} ${item.nom}`
              .toLowerCase()
              .includes(term) ||
            item.email
              .toLowerCase()
              .includes(term) ||
            item.telephone
              .toLowerCase()
              .includes(term) ||
            (
              item.documents ||
              []
            ).some(
              (
                document
              ) =>
                document.document_name
                  .toLowerCase()
                  .includes(term) ||
                document.activation_code
                  .toLowerCase()
                  .includes(term)
            )
        );

      },
      [
        inscrits,
        searchTerm,
      ]
    );


  // ========================================================
  // DÉCLARER ENSEIGNANT
  // ========================================================

  const handleDeclarerEnseignant =
    async (
      id:
        number
    ) => {

      const utilisateur =
        inscrits.find(
          (
            u
          ) =>
            u.id ===
            id
        );


      if (!utilisateur) {
        return;
      }


      const confirmation =
        window.confirm(
          `Voulez-vous déclarer ${utilisateur.prenom} ${utilisateur.nom} comme enseignant ?`
        );


      if (!confirmation) {
        return;
      }


      try {

        const res =
          await api.post(
            `/api/admin/teachers/${id}`
          );


        setInscrits(
          (
            prev
          ) =>
            prev.map(
              (
                u
              ) =>
                u.id ===
                  id
                  ? {
                      ...u,

                      enseignant:
                        true,

                      enseignant_actif:
                        true,

                      subjects:
                        [],

                    }
                  : u
            )
        );


        alert(
          res.data.message ||
          "L'utilisateur est maintenant enseignant."
        );


      } catch (
        err: any
      ) {

        console.error(
          "Erreur déclaration enseignant :",
          err
        );


        if (
          err?.response?.status ===
          400
        ) {

          alert(
            err.response.data?.detail ||
            "Cet utilisateur est déjà enseignant."
          );

        } else if (
          err?.response?.status ===
          401
        ) {

          alert(
            "Votre session a expiré. Veuillez vous reconnecter."
          );

        } else if (
          err?.response?.status ===
          403
        ) {

          alert(
            "Vous n'avez pas les droits administrateur nécessaires."
          );

        } else if (
          err?.response?.status ===
          404
        ) {

          alert(
            "Utilisateur introuvable."
          );

        } else {

          alert(
            "Erreur lors de la déclaration comme enseignant."
          );

        }

      }

    };


  // ========================================================
  // VALIDATION
  // ========================================================

  const handleValider =
    async (
      id:
        number
    ) => {

      try {

        const res =
          await api.post(
            `/api/admin/valider-inscrit/${id}`
          );


        setInscrits(
          (
            prev
          ) =>
            prev.map(
              (
                u
              ) =>
                u.id ===
                  id
                  ? {
                      ...u,

                      status:
                        "validated",

                      is_validated:
                        true,

                    }
                  : u
            )
        );


        alert(
          res.data.message
        );


      } catch (
        err
      ) {

        console.error(
          err
        );


        alert(
          "Erreur lors de la validation."
        );

      }

    };


  // ========================================================
  // REFUS
  // ========================================================

  const handleRefuser =
    async (
      id:
        number
    ) => {

      try {

        const res =
          await api.post(
            `/api/admin/refuser-inscrit/${id}`
          );


        setInscrits(
          (
            prev
          ) =>
            prev.filter(
              (
                u
              ) =>
                u.id !==
                id
            )
        );


        setTotalInscrits(
          (
            prev
          ) =>
            Math.max(
              0,
              prev -
              1
            )
        );


        alert(
          res.data.message
        );


      } catch (
        err
      ) {

        console.error(
          err
        );


        alert(
          "Erreur lors du refus."
        );

      }

    };


  // ========================================================
  // BLOQUER / RÉACTIVER
  // ========================================================

  const handleBlock =
    async (
      id:
        number,
      blocked?:
        boolean
    ) => {

      try {

        const action =
          blocked
            ? "reactivate"
            : "block";


        const res =
          await api.post(
            `/api/admin/${action}-user/${id}`
          );


        setInscrits(
          (
            prev
          ) =>
            prev.map(
              (
                u
              ) =>
                u.id ===
                  id
                  ? {
                      ...u,

                      is_blocked:
                        !blocked,

                    }
                  : u
            )
        );


        alert(
          res.data.message
        );


      } catch (
        err
      ) {

        console.error(
          err
        );


        alert(
          "Erreur lors du blocage/réactivation."
        );

      }

    };


  // ========================================================
  // CHARGEMENT INITIAL
  // ========================================================

  if (
    authLoading ||
    accessChecking
  ) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-slate-50
          dark:bg-gray-950
          px-6
        "
      >

        <div
          className="
            w-full
            max-w-md
            rounded-3xl
            bg-white
            dark:bg-gray-900
            border
            border-gray-200
            dark:border-gray-800
            shadow-xl
            p-8
            text-center
          "
        >

          <div
            className="
              mx-auto
              mb-5
              w-14
              h-14
              rounded-2xl
              bg-blue-50
              dark:bg-blue-900/20
              flex
              items-center
              justify-center
            "
          >

            <Loader2
              size={30}
              className="
                animate-spin
                text-blue-600
              "
            />

          </div>


          <h2
            className="
              text-lg
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            Vérification des autorisations
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            Préparation de votre espace de gestion...
          </p>

        </div>

      </div>

    );

  }


  // ========================================================
  // AFFICHAGE
  // ========================================================

  return (

    <motion.div

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      exit={{
        opacity: 0,
        y: -20,
      }}

      transition={{
        duration: 0.45,
      }}

      className="
        min-h-screen
        bg-slate-50
        dark:bg-gray-950
        px-4
        py-6
        sm:px-6
        lg:px-8
      "
    >

      <div
        className="
          max-w-[1800px]
          mx-auto
        "
      >

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            bg-gradient-to-br
            from-blue-700
            via-blue-600
            to-indigo-700
            shadow-xl
            mb-6
          "
        >

          <div
            className="
              absolute
              -right-16
              -top-20
              w-64
              h-64
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              absolute
              -left-20
              -bottom-24
              w-72
              h-72
              rounded-full
              bg-white/5
            "
          />


          <div
            className="
              relative
              z-10
              p-6
              sm:p-8
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-6
            "
          >

            <div>

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-white/15
                  border
                  border-white/20
                  text-white
                  text-xs
                  font-semibold
                  mb-4
                "
              >

                {user?.is_admin ? (
                  <>
                    <ShieldCheck size={15} />
                    Administration CODE
                  </>
                ) : (
                  <>
                    <Building2 size={15} />
                    Espace direction
                  </>
                )}

              </div>


              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-black
                  tracking-tight
                  text-white
                "
              >
                {user?.is_admin
                  ? "Gestion des utilisateurs"
                  : "Utilisateurs de mes écoles"}
              </h1>


              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  sm:text-base
                  text-blue-100
                "
              >
                {user?.is_admin
                  ? "Gérez les inscriptions, les enseignants, les directions, les écoles et les accès aux documents."
                  : "Consultez les membres de vos écoles et gérez les associations avec les enseignants."}
              </p>

            </div>


            <div
              className="
                shrink-0
                flex
                items-center
                justify-center
                w-16
                h-16
                rounded-2xl
                bg-white/15
                border
                border-white/20
                backdrop-blur-sm
              "
            >

              {user?.is_admin ? (
                <Users
                  size={32}
                  className="text-white"
                />
              ) : (
                <School
                  size={32}
                  className="text-white"
                />
              )}

            </div>

          </div>

        </div>


        {/* ==================================================
            STATISTIQUES
        ================================================== */}

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-5
            gap-3
            sm:gap-4
            mb-6
          "
        >

          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  Utilisateurs
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                    text-gray-900
                    dark:text-white
                  "
                >
                  {totalInscrits}
                </p>

              </div>


              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-blue-50
                  dark:bg-blue-900/20
                  flex
                  items-center
                  justify-center
                "
              >

                <Users
                  size={20}
                  className="text-blue-600"
                />

              </div>

            </div>

          </div>


          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  En attente
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                    text-amber-600
                  "
                >
                  {pendingCount}
                </p>

              </div>


              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-amber-50
                  dark:bg-amber-900/20
                  flex
                  items-center
                  justify-center
                "
              >

                <Clock3
                  size={20}
                  className="text-amber-600"
                />

              </div>

            </div>

          </div>


          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  Enseignants
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                    text-indigo-600
                  "
                >
                  {teacherCount}
                </p>

              </div>


              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-indigo-50
                  dark:bg-indigo-900/20
                  flex
                  items-center
                  justify-center
                "
              >

                <GraduationCap
                  size={20}
                  className="text-indigo-600"
                />

              </div>

            </div>

          </div>


          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  En ligne
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                    text-emerald-600
                  "
                >
                  {onlineCount}
                </p>

              </div>


              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-emerald-50
                  dark:bg-emerald-900/20
                  flex
                  items-center
                  justify-center
                "
              >

                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

              </div>

            </div>

          </div>


          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-4
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  Documents
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                    text-purple-600
                  "
                >
                  {documentsCount}
                </p>

              </div>


              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-purple-50
                  dark:bg-purple-900/20
                  flex
                  items-center
                  justify-center
                "
              >

                <FileText
                  size={20}
                  className="text-purple-600"
                />

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            INFORMATION DIRECTEUR
        ================================================== */}

        {isDirector &&
        !user?.is_admin && (

          <div
            className="
              mb-6
              rounded-2xl
              bg-amber-50
              dark:bg-amber-950/20
              border
              border-amber-200
              dark:border-amber-800
              p-5
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                gap-4
              "
            >

              <div
                className="
                  shrink-0
                  w-11
                  h-11
                  rounded-xl
                  bg-amber-100
                  dark:bg-amber-900/30
                  flex
                  items-center
                  justify-center
                "
              >

                <School
                  size={22}
                  className="
                    text-amber-600
                    dark:text-amber-400
                  "
                />

              </div>


              <div className="flex-1">

                <p
                  className="
                    font-bold
                    text-amber-900
                    dark:text-amber-300
                  "
                >
                  Vous êtes directeur de
                </p>


                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {directorSchools.map(
                    (
                      school
                    ) => (

                      <span
                        key={
                          school.school_id
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          px-3
                          py-1.5
                          rounded-full
                          bg-white
                          dark:bg-gray-900
                          border
                          border-amber-200
                          dark:border-amber-700
                          text-sm
                          font-semibold
                          text-gray-700
                          dark:text-gray-200
                        "
                      >

                        <Building2
                          size={14}
                          className="text-amber-600"
                        />

                        {
                          school.school_name
                        }

                      </span>

                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        )}


        {/* ==================================================
            BARRE OUTILS
        ================================================== */}

        <div
          className="
            rounded-2xl
            bg-white
            dark:bg-gray-900
            border
            border-gray-200
            dark:border-gray-800
            shadow-sm
            p-4
            mb-4
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-4
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Users
                  size={19}
                  className="text-blue-600"
                />

                <h2
                  className="
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {user?.is_admin
                    ? "Liste des inscrits"
                    : "Membres des écoles"}
                </h2>

              </div>


              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                {loadingListe
                  ? "Actualisation des données..."
                  : `${startIndex || 0}–${endIndex || 0} sur ${totalInscrits} utilisateur(s)`}
              </p>

            </div>


            <div
              className="
                relative
                w-full
                md:w-80
              "
            >

              <Search
                size={18}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(
                  e
                ) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Rechercher un utilisateur..."
                className="
                  w-full
                  pl-10
                  pr-4
                  py-2.5
                  rounded-xl
                  border
                  border-gray-200
                  dark:border-gray-700
                  bg-gray-50
                  dark:bg-gray-800
                  text-gray-900
                  dark:text-white
                  text-sm
                  outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:border-blue-500
                "
              />

            </div>

          </div>


          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <span
              className="
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                bg-gray-100
                dark:bg-gray-800
                text-xs
                font-semibold
                text-gray-600
                dark:text-gray-300
              "
            >

              <Eye size={14} />

              {displayedInscrits.length}
              {" "}
              résultat(s) affiché(s)

            </span>


            {pendingCount > 0 && (

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-amber-50
                  dark:bg-amber-900/20
                  text-xs
                  font-semibold
                  text-amber-700
                  dark:text-amber-300
                "
              >

                <Clock3 size={14} />

                {pendingCount}
                {" "}
                en attente

              </span>

            )}


            {blockedCount > 0 && (

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-red-50
                  dark:bg-red-900/20
                  text-xs
                  font-semibold
                  text-red-700
                  dark:text-red-300
                "
              >

                <Ban size={14} />

                {blockedCount}
                {" "}
                bloqué(s)

              </span>

            )}

          </div>

        </div>


        {/* ==================================================
            CHARGEMENT / VIDE
        ================================================== */}

        {loadingListe &&
        inscrits.length ===
          0 ? (

          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-12
              text-center
            "
          >

            <Loader2
              size={34}
              className="
                animate-spin
                mx-auto
                text-blue-600
              "
            />

            <p
              className="
                mt-4
                font-semibold
                text-gray-700
                dark:text-gray-200
              "
            >
              Chargement des utilisateurs...
            </p>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Veuillez patienter quelques instants.
            </p>

          </div>

        ) : inscrits.length ===
          0 ? (

          <div
            className="
              rounded-2xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-12
              text-center
            "
          >

            <div
              className="
                mx-auto
                w-14
                h-14
                rounded-2xl
                bg-gray-100
                dark:bg-gray-800
                flex
                items-center
                justify-center
              "
            >

              <Users
                size={27}
                className="text-gray-400"
              />

            </div>


            <p
              className="
                mt-4
                font-bold
                text-gray-800
                dark:text-gray-200
              "
            >
              Aucun inscrit pour le moment
            </p>


            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              Aucun utilisateur ne correspond aux données disponibles.
            </p>

          </div>

        ) : (

          <>

            {/* ==================================================
                TABLEAU
            ================================================== */}

            <div
              className="
                overflow-hidden
                rounded-2xl
                bg-white
                dark:bg-gray-900
                border
                border-gray-200
                dark:border-gray-800
                shadow-sm
              "
            >

              <div
                className="
                  overflow-x-auto
                "
              >

                <table
                  className="
                    min-w-full
                    text-sm
                  "
                >

                  {/* =================================================
                      EN-TÊTE ADMIN
                  ================================================= */}

                  {user?.is_admin ? (

                    <thead>

                      <tr
                        className="
                          bg-slate-900
                          dark:bg-black
                          text-white
                        "
                      >

                        <th className="px-4 py-4 text-left font-bold">
                          Nom
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Prénom
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Email
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Parrain
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Filleuls
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Téléphone
                        </th>

                        <th className="px-4 py-4 text-left font-bold whitespace-nowrap">
                          Date inscription
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Statut
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Blocage
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Enseignant
                        </th>

                        <th
                          className="
                            px-4
                            py-4
                            min-w-[240px]
                            text-left
                            font-bold
                          "
                        >
                          Directeur
                        </th>

                        <th
                          className="
                            px-4
                            py-4
                            min-w-[260px]
                            text-left
                            font-bold
                          "
                        >
                          École
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Actions
                        </th>

                        <th
                          className="
                            px-4
                            py-4
                            min-w-[280px]
                            text-left
                            font-bold
                          "
                        >
                          Documents
                        </th>

                      </tr>

                    </thead>

                  ) : (

                    <thead>

                      <tr
                        className="
                          bg-amber-600
                          text-white
                        "
                      >

                        <th className="px-4 py-4 text-left font-bold">
                          Nom
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Prénom
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Email
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Téléphone
                        </th>

                        <th className="px-4 py-4 text-left font-bold whitespace-nowrap">
                          Date inscription
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Statut
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Blocage
                        </th>

                        <th
                          className="
                            px-4
                            py-4
                            min-w-[220px]
                            text-left
                            font-bold
                          "
                        >
                          Prof
                        </th>

                        <th className="px-4 py-4 text-left font-bold">
                          Act
                        </th>

                        <th
                          className="
                            px-4
                            py-4
                            min-w-[280px]
                            text-left
                            font-bold
                          "
                        >
                          Documents
                        </th>

                      </tr>

                    </thead>

                  )}


                  {/* =================================================
                      CORPS
                  ================================================= */}

                  <tbody>

                    {displayedInscrits.map(
                      (
                        i
                      ) => {

                        const nombreDocuments =
                          Array.isArray(
                            i.documents
                          )
                            ? i.documents.length
                            : 0;


                        const activeDirectorships =
                          (
                            i.directorships ||
                            []
                          ).filter(
                            (
                              direction
                            ) =>
                              direction.is_active
                          );


                        const teacherSchools =
                          isDirector &&
                          !user?.is_admin
                            ? getTeacherSchoolsForDirector(
                                i.id
                              )
                            : [];


                        return (

                          <tr
                            key={
                              i.id
                            }
                            className="
                              border-b
                              border-gray-100
                              dark:border-gray-800
                              hover:bg-blue-50/40
                              dark:hover:bg-gray-800/50
                              transition-colors
                            "
                          >

                            {/* NOM */}

                            <td className="px-4 py-4 align-top">

                              <div
                                className="
                                  flex
                                  flex-col
                                  gap-2
                                  min-w-[170px]
                                "
                              >

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                  "
                                >

                                  <span
                                    className="
                                      font-bold
                                      text-gray-900
                                      dark:text-white
                                      whitespace-nowrap
                                    "
                                  >
                                    {i.nom}
                                  </span>


                                  {nombreDocuments >
                                    0 && (

                                    <span
                                      className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        w-7
                                        h-7
                                        rounded-lg
                                        bg-amber-50
                                        dark:bg-amber-900/20
                                        text-amber-600
                                        dark:text-amber-400
                                      "
                                      title={
                                        `${nombreDocuments} document${
                                          nombreDocuments >
                                          1
                                            ? "s"
                                            : ""
                                        } attribué${
                                          nombreDocuments >
                                          1
                                            ? "s"
                                            : ""
                                        }`
                                      }
                                    >

                                      <KeyRound
                                        size={15}
                                      />

                                    </span>

                                  )}

                                </div>


                                {i.is_online ? (

                                  <span
                                    className="
                                      inline-flex
                                      w-fit
                                      items-center
                                      gap-1.5
                                      px-2
                                      py-1
                                      rounded-full
                                      bg-emerald-50
                                      dark:bg-emerald-900/20
                                      text-emerald-700
                                      dark:text-emerald-300
                                      text-xs
                                      font-bold
                                    "
                                  >

                                    <span
                                      className="
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                        bg-emerald-500
                                      "
                                    />

                                    Connecté

                                  </span>

                                ) : (

                                  <span
                                    className="
                                      inline-flex
                                      w-fit
                                      items-center
                                      gap-1.5
                                      px-2
                                      py-1
                                      rounded-full
                                      bg-gray-100
                                      dark:bg-gray-800
                                      text-gray-500
                                      dark:text-gray-400
                                      text-xs
                                      font-semibold
                                    "
                                  >

                                    <span
                                      className="
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                        bg-gray-400
                                      "
                                    />

                                    Déconnecté

                                  </span>

                                )}

                              </div>

                            </td>


                            {/* PRÉNOM */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                                whitespace-nowrap
                              "
                            >
                              {i.prenom}
                            </td>


                            {/* EMAIL */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                              "
                            >

                              <span
                                className="
                                  text-gray-700
                                  dark:text-gray-300
                                  whitespace-nowrap
                              "
                              >
                                {i.email}
                              </span>

                            </td>


                            {/* ADMIN : PARRAIN / FILLEULS */}

                            {user?.is_admin && (

                              <>

                                <td
                                  className="
                                    px-4
                                    py-4
                                    align-top
                                  "
                                >

                                  {i.parrain_email ? (

                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/admin/parrain/${encodeURIComponent(
                                            i.parrain_email
                                          )}`
                                        )
                                      }
                                      className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        text-blue-600
                                        dark:text-blue-400
                                        hover:text-blue-800
                                        dark:hover:text-blue-300
                                        hover:underline
                                        font-medium
                                      "
                                    >

                                      {i.parrain_email}

                                    </button>

                                  ) : (

                                    <span
                                      className="
                                        text-gray-400
                                        italic
                                      "
                                    >
                                      Aucun
                                    </span>

                                  )}

                                </td>


                                <td
                                  className="
                                    px-4
                                    py-4
                                    align-top
                                  "
                                >

                                  {i.filleuls_emails &&
                                  i.filleuls_emails.length >
                                    0 ? (

                                    <div
                                      className="
                                        flex
                                        flex-col
                                        gap-1.5
                                        min-w-[190px]
                                      "
                                    >

                                      {i.filleuls_emails.map(
                                        (
                                          mail
                                        ) => (

                                          <button
                                            key={
                                              mail
                                            }
                                            onClick={() =>
                                              navigate(
                                                `/admin/parrain/${encodeURIComponent(
                                                  mail
                                                )}`
                                              )
                                            }
                                            className="
                                              text-left
                                              text-blue-600
                                              dark:text-blue-400
                                              hover:underline
                                              text-xs
                                              font-medium
                                            "
                                          >
                                            {mail}
                                          </button>

                                        )
                                      )}

                                    </div>

                                  ) : (

                                    <span
                                      className="
                                        text-gray-400
                                        italic
                                      "
                                    >
                                      Aucun
                                    </span>

                                  )}

                                </td>

                              </>

                            )}


                            {/* TÉLÉPHONE */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                                whitespace-nowrap
                              "
                            >
                              {
                                i.telephone ||
                                "-"
                              }
                            </td>


                            {/* DATE */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                                whitespace-nowrap
                              "
                            >

                              {i.date_inscription
                                ? new Date(
                                    i.date_inscription
                                  ).toLocaleDateString(
                                    "fr-FR"
                                  )
                                : "-"}

                            </td>


                            {/* STATUT */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                              "
                            >

                              {i.status ===
                                "validated" && (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1.5
                                    rounded-full
                                    bg-emerald-50
                                    dark:bg-emerald-900/20
                                    text-emerald-700
                                    dark:text-emerald-300
                                    text-xs
                                    font-bold
                                    whitespace-nowrap
                                  "
                                >

                                  <CheckCircle2
                                    size={14}
                                  />

                                  Validé

                                </span>

                              )}


                              {i.status ===
                                "pending" && (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1.5
                                    rounded-full
                                    bg-amber-50
                                    dark:bg-amber-900/20
                                    text-amber-700
                                    dark:text-amber-300
                                    text-xs
                                    font-bold
                                    whitespace-nowrap
                                  "
                                >

                                  <Clock3
                                    size={14}
                                  />

                                  En attente

                                </span>

                              )}


                              {i.status ===
                                "refused" && (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1.5
                                    rounded-full
                                    bg-red-50
                                    dark:bg-red-900/20
                                    text-red-700
                                    dark:text-red-300
                                    text-xs
                                    font-bold
                                    whitespace-nowrap
                                  "
                                >

                                  <ShieldAlert
                                    size={14}
                                  />

                                  Refusé

                                </span>

                              )}

                            </td>


                            {/* BLOCAGE */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                              "
                            >

                              {i.is_blocked ? (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1.5
                                    rounded-full
                                    bg-red-50
                                    dark:bg-red-900/20
                                    text-red-700
                                    dark:text-red-300
                                    text-xs
                                    font-bold
                                    whitespace-nowrap
                                  "
                                >

                                  <Ban
                                    size={14}
                                  />

                                  Bloqué

                                </span>

                              ) : (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1.5
                                    rounded-full
                                    bg-emerald-50
                                    dark:bg-emerald-900/20
                                    text-emerald-700
                                    dark:text-emerald-300
                                    text-xs
                                    font-bold
                                    whitespace-nowrap
                                  "
                                >

                                  <CheckCircle2
                                    size={14}
                                  />

                                  Actif

                                </span>

                              )}

                            </td>


                            {/* ENSEIGNANT ADMIN */}

                            {user?.is_admin && (

                              <td
                                className="
                                  px-4
                                  py-4
                                  align-top
                                "
                              >

                                {i.enseignant ? (

                                  <div
                                    className="
                                      flex
                                      flex-col
                                      items-start
                                      gap-1.5
                                    "
                                  >

                                    <span
                                      className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-1.5
                                        rounded-full
                                        bg-indigo-50
                                        dark:bg-indigo-900/30
                                        text-indigo-700
                                        dark:text-indigo-300
                                        text-xs
                                        font-bold
                                        whitespace-nowrap
                                      "
                                    >

                                      <GraduationCap
                                        size={15}
                                      />

                                      Enseignant

                                    </span>


                                    {i.enseignant_actif ===
                                      false && (

                                      <span
                                        className="
                                          text-xs
                                          text-red-600
                                          dark:text-red-400
                                        "
                                      >
                                        Désactivé
                                      </span>

                                    )}

                                  </div>

                                ) : (

                                  <button
                                    onClick={() =>
                                      handleDeclarerEnseignant(
                                        i.id
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      gap-2
                                      px-3
                                      py-2
                                      bg-indigo-600
                                      text-white
                                      rounded-xl
                                      hover:bg-indigo-700
                                      transition
                                      font-semibold
                                      text-xs
                                      whitespace-nowrap
                                      shadow-sm
                                    "
                                  >

                                    <UserPlus
                                      size={15}
                                    />

                                    Déclarer enseignant

                                  </button>

                                )}

                              </td>

                            )}


                            {/* DIRECTEUR ADMIN */}

                            {user?.is_admin && (

                              <td
                                className="
                                  px-4
                                  py-4
                                  align-top
                                  text-center
                                "
                              >

                                {activeDirectorships.length >
                                0 ? (

                                  <div
                                    className="
                                      flex
                                      flex-col
                                      items-center
                                      gap-2
                                    "
                                  >

                                    {activeDirectorships.map(
                                      (
                                        direction
                                      ) => (

                                        <div
                                          key={
                                            `${i.id}-${direction.school_id}`
                                          }
                                          className="
                                            w-full
                                            min-w-[210px]
                                            rounded-xl
                                            bg-emerald-50
                                            dark:bg-emerald-900/20
                                            border
                                            border-emerald-200
                                            dark:border-emerald-800
                                            p-3
                                          "
                                        >

                                          <div
                                            className="
                                              flex
                                              items-center
                                              justify-center
                                              gap-2
                                              text-emerald-700
                                              dark:text-emerald-300
                                              font-bold
                                              text-sm
                                            "
                                          >

                                            <School
                                              size={17}
                                            />

                                            Directeur

                                          </div>


                                          <div
                                            className="
                                              mt-2
                                              text-sm
                                              text-gray-700
                                              dark:text-gray-300
                                              font-semibold
                                            "
                                          >
                                            {
                                              direction.school_name
                                            }
                                          </div>


                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveDirector(
                                                i,
                                                direction.school_id
                                              )
                                            }
                                            disabled={
                                              directorRemoving ===
                                              direction.school_id
                                            }
                                            className="
                                              mt-3
                                              inline-flex
                                              items-center
                                              justify-center
                                              gap-1.5
                                              px-3
                                              py-1.5
                                              text-xs
                                              font-bold
                                              rounded-lg
                                              bg-red-600
                                              text-white
                                              hover:bg-red-700
                                              transition
                                              disabled:opacity-50
                                            "
                                          >

                                            {directorRemoving ===
                                            direction.school_id ? (

                                              <>

                                                <Loader2
                                                  size={14}
                                                  className="animate-spin"
                                                />

                                                Retrait...

                                              </>

                                            ) : (

                                              <>

                                                <UserMinus
                                                  size={14}
                                                />

                                                Retirer

                                              </>

                                            )}

                                          </button>

                                        </div>

                                      )
                                    )}


                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenDirectorModal(
                                          i
                                        )
                                      }
                                      className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        rounded-xl
                                        border
                                        border-emerald-600
                                        text-emerald-700
                                        dark:text-emerald-300
                                        hover:bg-emerald-50
                                        dark:hover:bg-emerald-900/20
                                        font-bold
                                        text-xs
                                        transition
                                        whitespace-nowrap
                                      "
                                    >

                                      <School
                                        size={15}
                                      />

                                      Ajouter une école

                                    </button>

                                  </div>

                                ) : (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenDirectorModal(
                                        i
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      gap-2
                                      px-3
                                      py-2.5
                                      bg-emerald-600
                                      text-white
                                      rounded-xl
                                      hover:bg-emerald-700
                                      transition
                                      font-bold
                                      text-xs
                                      whitespace-nowrap
                                      shadow-sm
                                    "
                                  >

                                    <UserCheck
                                      size={16}
                                    />

                                    Désigner directeur

                                  </button>

                                )}

                              </td>

                            )}


                            {/* ÉCOLE ADMIN */}

                            {user?.is_admin && (

                              <td
                                className="
                                  px-4
                                  py-4
                                  align-top
                                "
                              >

                                {renderUserSchools(
                                  i
                                )}

                              </td>

                            )}


                            {/* ACTIONS ADMIN */}

                            {user?.is_admin && (

                              <td
                                className="
                                  px-4
                                  py-4
                                  align-top
                                "
                              >

                                {i.status ===
                                "pending" ? (

                                  <div
                                    className="
                                      flex
                                      flex-col
                                      gap-2
                                      min-w-[110px]
                                    "
                                  >

                                    <button
                                      onClick={() =>
                                        handleValider(
                                          i.id
                                        )
                                      }
                                      className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        px-3
                                        py-2
                                        bg-emerald-600
                                        text-white
                                        rounded-xl
                                        hover:bg-emerald-700
                                        transition
                                        font-bold
                                        text-xs
                                      "
                                    >

                                      <CheckCircle2
                                        size={15}
                                      />

                                      Valider

                                    </button>


                                    <button
                                      onClick={() =>
                                        handleRefuser(
                                          i.id
                                        )
                                      }
                                      className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        px-3
                                        py-2
                                        bg-red-600
                                        text-white
                                        rounded-xl
                                        hover:bg-red-700
                                        transition
                                        font-bold
                                        text-xs
                                      "
                                    >

                                      <X
                                        size={15}
                                      />

                                      Refuser

                                    </button>

                                  </div>

                                ) : (

                                  <button
                                    onClick={() =>
                                      handleBlock(
                                        i.id,
                                        i.is_blocked
                                      )
                                    }
                                    className={`
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-2
                                      px-3
                                      py-2
                                      rounded-xl
                                      text-white
                                      transition
                                      font-bold
                                      text-xs
                                      min-w-[110px]
                                      ${
                                        i.is_blocked
                                          ? "bg-emerald-600 hover:bg-emerald-700"
                                          : "bg-red-600 hover:bg-red-700"
                                      }
                                    `}
                                  >

                                    {i.is_blocked ? (
                                      <>
                                        <RefreshCcw
                                          size={15}
                                        />
                                        Réactiver
                                      </>
                                    ) : (
                                      <>
                                        <Ban
                                          size={15}
                                        />
                                        Bloquer
                                      </>
                                    )}

                                  </button>

                                )}

                              </td>

                            )}


                            {/* PROF DIRECTEUR */}

                            {isDirector &&
                            !user?.is_admin && (

                              <td
                                className="
                                  px-4
                                  py-4
                                  align-top
                                  text-center
                                "
                              >

                                {directorTeachersLoading ? (

                                  <Loader2
                                    size={19}
                                    className="
                                      animate-spin
                                      mx-auto
                                      text-amber-600
                                    "
                                  />

                                ) : teacherSchools.length >
                                  0 ? (

                                  <div
                                    className="
                                      flex
                                      flex-col
                                      items-center
                                      gap-2
                                    "
                                  >

                                    {teacherSchools.map(
                                      (
                                        teacherSchool
                                      ) => (

                                        <span
                                          key={
                                            `${teacherSchool.school_id}-${teacherSchool.user_id}`
                                          }
                                          className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            px-3
                                            py-1.5
                                            rounded-full
                                            bg-indigo-50
                                            dark:bg-indigo-900/30
                                            text-indigo-700
                                            dark:text-indigo-300
                                            text-xs
                                            font-bold
                                            whitespace-nowrap
                                          "
                                        >

                                          <GraduationCap
                                            size={14}
                                          />

                                          Prof

                                          <span
                                            className="
                                              font-normal
                                            "
                                          >
                                            {teacherSchool.school_name
                                              ? `— ${teacherSchool.school_name}`
                                              : ""}
                                          </span>

                                        </span>

                                      )
                                    )}

                                  </div>

                                ) : (

                                  <span
                                    className="
                                      text-gray-400
                                      italic
                                    "
                                  >
                                    Non
                                  </span>

                                )}

                              </td>

                            )}


                            {/* ACT DIRECTEUR */}

                            {isDirector &&
                            !user?.is_admin && (

                              <td
                                className="
                                  px-4
                                  py-4
                                  align-top
                                  text-center
                                "
                              >

                                {teacherSchools.length >
                                0 ? (

                                  <div
                                    className="
                                      flex
                                      flex-col
                                      items-center
                                      gap-2
                                    "
                                  >

                                    {teacherSchools.map(
                                      (
                                        teacherSchool
                                      ) => (

                                        <button
                                          key={
                                            `${teacherSchool.school_id}-${teacherSchool.user_id}-remove`
                                          }
                                          type="button"
                                          onClick={() =>
                                            handleRemoveTeacherFromSchool(
                                              i,
                                              teacherSchool.school_id,
                                              teacherSchool.school_name ||
                                                "cette école"
                                            )
                                          }
                                          disabled={
                                            teacherRemoving?.userId ===
                                              i.id &&
                                            teacherRemoving?.schoolId ===
                                              teacherSchool.school_id
                                          }
                                          className="
                                            inline-flex
                                            items-center
                                            justify-center
                                            gap-2
                                            px-3
                                            py-2
                                            rounded-xl
                                            bg-red-600
                                            text-white
                                            hover:bg-red-700
                                            transition
                                            font-bold
                                            text-xs
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                          "
                                        >

                                          {teacherRemoving?.userId ===
                                            i.id &&
                                          teacherRemoving?.schoolId ===
                                            teacherSchool.school_id ? (

                                            <>

                                              <Loader2
                                                size={15}
                                                className="animate-spin"
                                              />

                                              Retrait...

                                            </>

                                          ) : (

                                            <>

                                              <UserMinus
                                                size={15}
                                              />

                                              Supprimer

                                            </>

                                          )}

                                        </button>

                                      )
                                    )}

                                  </div>

                                ) : (

                                  <span
                                    className="
                                      text-gray-400
                                      italic
                                    "
                                  >
                                    —
                                  </span>

                                )}

                              </td>

                            )}


                            {/* DOCUMENTS */}

                            <td
                              className="
                                px-4
                                py-4
                                align-top
                              "
                            >

                              {nombreDocuments >
                              0 ? (

                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-2
                                    min-w-[260px]
                                  "
                                >

                                  {i.documents!.map(
                                    (
                                      document
                                    ) => (

                                      <div
                                        key={
                                          document.id
                                        }
                                        className="
                                          rounded-xl
                                          bg-purple-50
                                          dark:bg-purple-900/20
                                          border
                                          border-purple-100
                                          dark:border-purple-800
                                          p-3
                                        "
                                      >

                                        <div
                                          className="
                                            flex
                                            items-start
                                            gap-2
                                          "
                                        >

                                          <div
                                            className="
                                              shrink-0
                                              w-8
                                              h-8
                                              rounded-lg
                                              bg-purple-100
                                              dark:bg-purple-900/40
                                              flex
                                              items-center
                                              justify-center
                                            "
                                          >

                                            <BookOpen
                                              size={15}
                                              className="
                                                text-purple-600
                                                dark:text-purple-300
                                              "
                                            />

                                          </div>


                                          <div
                                            className="
                                              min-w-0
                                            "
                                          >

                                            <div
                                              className="
                                                font-bold
                                                text-purple-700
                                                dark:text-purple-300
                                                text-sm
                                              "
                                            >

                                              {
                                                document.document_name
                                              }

                                            </div>


                                            <div
                                              className="
                                                mt-1
                                                flex
                                                items-center
                                                gap-1
                                                text-xs
                                                text-gray-600
                                                dark:text-gray-300
                                              "
                                            >

                                              <KeyRound
                                                size={12}
                                              />

                                              Code :

                                              <span
                                                className="
                                                  font-mono
                                                  font-bold
                                                  text-gray-800
                                                  dark:text-gray-200
                                                "
                                              >
                                                {
                                                  document.activation_code
                                                }
                                              </span>

                                            </div>


                                            <div
                                              className="
                                                mt-2
                                              "
                                            >

                                              {document.is_activated ? (

                                                <span
                                                  className="
                                                    inline-flex
                                                    items-center
                                                    gap-1
                                                    text-emerald-600
                                                    dark:text-emerald-400
                                                    font-bold
                                                    text-xs
                                                  "
                                                >

                                                  <CheckCircle2
                                                    size={13}
                                                  />

                                                  Activé

                                                </span>

                                              ) : (

                                                <span
                                                  className="
                                                    inline-flex
                                                    items-center
                                                    gap-1
                                                    text-orange-600
                                                    dark:text-orange-400
                                                    font-bold
                                                    text-xs
                                                  "
                                                >

                                                  <Clock3
                                                    size={13}
                                                  />

                                                  Non activé

                                                </span>

                                              )}

                                            </div>


                                            {document.activated_at && (

                                              <div
                                                className="
                                                  text-[11px]
                                                  text-gray-500
                                                  dark:text-gray-400
                                                  mt-1
                                                "
                                              >

                                                Activé le{" "}

                                                {new Date(
                                                  document.activated_at
                                                ).toLocaleString(
                                                  "fr-FR"
                                                )}

                                              </div>

                                            )}

                                          </div>

                                        </div>

                                      </div>

                                    )
                                  )}

                                </div>

                              ) : (

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    text-gray-400
                                    dark:text-gray-500
                                    italic
                                    text-sm
                                  "
                                >

                                  <FileText
                                    size={15}
                                  />

                                  Aucun document

                                </span>

                              )}

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>


              {/* ==================================================
                  CHARGEMENT PENDANT ACTUALISATION
              ================================================== */}

              {loadingListe &&
              inscrits.length >
                0 && (

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-3
                    border-t
                    border-gray-100
                    dark:border-gray-800
                    bg-gray-50
                    dark:bg-gray-950/50
                    text-sm
                    text-gray-600
                    dark:text-gray-300
                  "
                >

                  <Loader2
                    size={17}
                    className="
                      animate-spin
                      text-blue-600
                    "
                  />

                  Actualisation en cours...

                </div>

              )}

            </div>


            {/* ==================================================
                PAGINATION
            ================================================== */}

            {totalInscrits >
              0 && (

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >

                <div
                  className="
                    text-sm
                    text-gray-500
                    dark:text-gray-400
                  "
                >

                  Affichage de{" "}

                  <span
                    className="
                      font-bold
                      text-gray-800
                      dark:text-gray-200
                    "
                  >
                    {startIndex}
                  </span>

                  {" "}à{" "}

                  <span
                    className="
                      font-bold
                      text-gray-800
                      dark:text-gray-200
                    "
                  >
                    {endIndex}
                  </span>

                  {" "}sur{" "}

                  <span
                    className="
                      font-bold
                      text-gray-800
                      dark:text-gray-200
                    "
                  >
                    {totalInscrits}
                  </span>

                  {" "}inscrit(s).

                </div>


                {totalPages >
                  1 && (

                  <div
                    className="
                      flex
                      flex-wrap
                      justify-center
                      items-center
                      gap-1.5
                    "
                  >

                    <button
                      onClick={() =>
                        setPage(
                          (
                            currentPage
                          ) =>
                            Math.max(
                              currentPage -
                                1,
                              1
                            )
                        )
                      }
                      disabled={
                        page ===
                          1 ||
                        loadingListe
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-3
                        py-2
                        rounded-xl
                        border
                        border-gray-200
                        dark:border-gray-700
                        bg-white
                        dark:bg-gray-900
                        text-gray-700
                        dark:text-gray-200
                        hover:bg-gray-50
                        dark:hover:bg-gray-800
                        font-semibold
                        text-sm
                        transition
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >

                      <ChevronLeft
                        size={16}
                      />

                      <span className="hidden sm:inline">
                        Précédent
                      </span>

                    </button>


                    {visiblePages.map(
                      (
                        pageNumber,
                        index
                      ) => {

                        const previousPage =
                          visiblePages[
                            index -
                              1
                          ];


                        const showEllipsis =
                          previousPage !==
                            undefined &&
                          pageNumber -
                            previousPage >
                            1;


                        return (

                          <React.Fragment
                            key={
                              pageNumber
                            }
                          >

                            {showEllipsis && (

                              <span
                                className="
                                  px-1
                                  text-gray-400
                                "
                              >
                                ...
                              </span>

                            )}


                            <button
                              onClick={() =>
                                setPage(
                                  pageNumber
                                )
                              }
                              disabled={
                                loadingListe
                              }
                              className={`
                                min-w-[38px]
                                h-[38px]
                                px-3
                                rounded-xl
                                font-bold
                                text-sm
                                transition
                                ${
                                  page ===
                                  pageNumber
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                                }
                                disabled:opacity-40
                              `}
                            >
                              {
                                pageNumber
                              }
                            </button>

                          </React.Fragment>

                        );

                      }
                    )}


                    <button
                      onClick={() =>
                        setPage(
                          (
                            currentPage
                          ) =>
                            Math.min(
                              currentPage +
                                1,
                              totalPages
                            )
                        )
                      }
                      disabled={
                        page ===
                          totalPages ||
                        loadingListe
                      }
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        px-3
                        py-2
                        rounded-xl
                        border
                        border-gray-200
                        dark:border-gray-700
                        bg-white
                        dark:bg-gray-900
                        text-gray-700
                        dark:text-gray-200
                        hover:bg-gray-50
                        dark:hover:bg-gray-800
                        font-semibold
                        text-sm
                        transition
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                      "
                    >

                      <span className="hidden sm:inline">
                        Suivant
                      </span>

                      <ChevronRight
                        size={16}
                      />

                    </button>

                  </div>

                )}

              </div>

            )}

          </>

        )}


        {/* ====================================================
            ADMINISTRATION
        ==================================================== */}

        {user?.is_admin && (

          <div
            className="
              mt-8
              rounded-3xl
              bg-white
              dark:bg-gray-900
              border
              border-gray-200
              dark:border-gray-800
              shadow-sm
              p-5
              sm:p-7
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                mb-5
              "
            >

              <div
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-slate-100
                  dark:bg-gray-800
                  flex
                  items-center
                  justify-center
                "
              >

                <Settings
                  size={22}
                  className="text-slate-700 dark:text-gray-200"
                />

              </div>


              <div>

                <h2
                  className="
                    font-black
                    text-lg
                    text-gray-900
                    dark:text-white
                  "
                >
                  Administration CODE
                </h2>

                <p
                  className="
                    text-sm
                    text-gray-500
                    dark:text-gray-400
                  "
                >
                  Accès rapide aux outils de gestion.
                </p>

              </div>

            </div>


            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-3
              "
            >

              <button
                onClick={() =>
                  navigate(
                    "/admin/documents"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  font-bold
                  rounded-xl
                  bg-purple-600
                  text-white
                  hover:bg-purple-700
                  transition
                  shadow-sm
                "
              >

                <BookOpen
                  size={18}
                />

                Gestion des documents

              </button>


              <button
                onClick={() =>
                  navigate(
                    "/admin/enseignants"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  font-bold
                  rounded-xl
                  bg-indigo-600
                  text-white
                  hover:bg-indigo-700
                  transition
                  shadow-sm
                "
              >

                <GraduationCap
                  size={18}
                />

                Gestion des enseignants

              </button>


              <button
                onClick={() =>
                  navigate(
                    "/admin/ecoles"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  font-bold
                  rounded-xl
                  bg-emerald-600
                  text-white
                  hover:bg-emerald-700
                  transition
                  shadow-sm
                "
              >

                <School
                  size={18}
                />

                Gestion des écoles

              </button>


              <button
                onClick={() =>
                  navigate(
                    "/admin/projets"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  font-bold
                  rounded-xl
                  bg-cyan-600
                  text-white
                  hover:bg-cyan-700
                  transition
                  shadow-sm
                "
              >

                <BookOpen
                  size={18}
                />

                Gestion des projets

              </button>


              <button
                onClick={() =>
                  navigate(
                    "/admin/codes-activation"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  font-bold
                  rounded-xl
                  bg-orange-600
                  text-white
                  hover:bg-orange-700
                  transition
                  shadow-sm
                "
              >

                <KeyRound
                  size={18}
                />

                Codes d'activation

              </button>


              <button
                onClick={() =>
                  navigate(
                    "/admin/historique-connections"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  font-bold
                  rounded-xl
                  bg-green-600
                  text-white
                  hover:bg-green-700
                  transition
                  shadow-sm
                "
              >

                <Eye
                  size={18}
                />

                Historique des connexions

              </button>

            </div>


            <div
              className="
                mt-6
                pt-5
                border-t
                border-gray-200
                dark:border-gray-800
                flex
                flex-col
                items-center
              "
            >

              <button
                onClick={() =>
                  navigate(
                    "/page2"
                  )
                }
                disabled={
                  pendingCount >
                  0
                }
                className={`
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-8
                  py-3
                  font-bold
                  rounded-xl
                  transition
                  w-full
                  sm:w-72
                  ${
                    pendingCount >
                    0
                      ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                  }
                `}
              >

                <CheckCircle2
                  size={18}
                />

                CONTINUER

              </button>


              {pendingCount >
                0 && (

                <p
                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-red-600
                    dark:text-red-400
                    mt-3
                    text-center
                  "
                >

                  <ShieldAlert
                    size={16}
                  />

                  Vous devez traiter toutes les inscriptions avant de continuer.

                </p>

              )}

            </div>


            <div
              className="
                mt-6
                pt-5
                border-t
                border-gray-200
                dark:border-gray-800
                flex
                justify-center
              "
            >

              <button
                onClick={() =>
                  navigate(
                    "/admin/questions"
                  )
                }
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-6
                  py-3
                  font-bold
                  rounded-xl
                  bg-indigo-600
                  text-white
                  hover:bg-indigo-700
                  transition
                  shadow-md
                  w-full
                  sm:w-72
                "
              >

                <Users
                  size={18}
                />

                Conversations admin

              </button>

            </div>

          </div>

        )}


        {/* ====================================================
            MODALE DÉSIGNATION DIRECTEUR
        ==================================================== */}

        {directorModalOpen &&
        selectedDirector && (

          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/60
              backdrop-blur-sm
              p-4
            "
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="
                relative
                w-full
                max-w-lg
                max-h-[90vh]
                overflow-y-auto
                bg-white
                dark:bg-gray-900
                rounded-3xl
                shadow-2xl
                border
                border-gray-200
                dark:border-gray-800
                p-6
              "
            >

              {/* FERMER */}

              <button
                type="button"
                onClick={
                  handleCloseDirectorModal
                }
                disabled={
                  directorSaving
                }
                className="
                  absolute
                  top-4
                  right-4
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:text-gray-900
                  dark:hover:text-white
                  hover:bg-gray-100
                  dark:hover:bg-gray-800
                  transition
                  disabled:opacity-50
                "
                aria-label="Fermer"
              >

                <X
                  size={20}
                />

              </button>


              {/* TITRE */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  mb-6
                  pr-10
                "
              >

                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-emerald-50
                    dark:bg-emerald-900/30
                    flex
                    items-center
                    justify-center
                  "
                >

                  <School
                    size={25}
                    className="
                      text-emerald-600
                      dark:text-emerald-400
                    "
                  />

                </div>


                <div>

                  <h2
                    className="
                      text-xl
                      font-black
                      text-gray-900
                      dark:text-white
                    "
                  >
                    Désigner un directeur
                  </h2>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    Administration CODE
                  </p>

                </div>

              </div>


              {/* UTILISATEUR */}

              <div
                className="
                  p-4
                  rounded-2xl
                  bg-blue-50
                  dark:bg-blue-900/20
                  border
                  border-blue-100
                  dark:border-blue-800
                  mb-5
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-blue-100
                      dark:bg-blue-900/40
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <UserCheck
                      size={21}
                      className="text-blue-600"
                    />

                  </div>


                  <div
                    className="
                      min-w-0
                    "
                  >

                    <p
                      className="
                        font-black
                        text-gray-900
                        dark:text-white
                      "
                    >
                      {
                        selectedDirector.prenom
                      }{" "}
                      {
                        selectedDirector.nom
                      }
                    </p>

                    <p
                      className="
                        text-sm
                        text-gray-600
                        dark:text-gray-300
                        truncate
                      "
                    >
                      {
                        selectedDirector.email
                      }
                    </p>

                  </div>

                </div>

              </div>


              {/* ÉCOLES DÉJÀ ASSOCIÉES */}

              {(
                selectedDirector.directorships ||
                []
              ).filter(
                (
                  direction
                ) =>
                  direction.is_active
              ).length >
                0 && (

                <div
                  className="
                    mb-5
                  "
                >

                  <p
                    className="
                      text-sm
                      font-bold
                      text-gray-700
                      dark:text-gray-300
                      mb-2
                    "
                  >
                    Directeur actuellement de :
                  </p>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >

                    {(
                      selectedDirector.directorships ||
                      []
                    )
                      .filter(
                        (
                          direction
                        ) =>
                          direction.is_active
                      )
                      .map(
                        (
                          direction
                        ) => (

                          <span
                            key={
                              direction.school_id
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              px-3
                              py-1.5
                              rounded-full
                              bg-emerald-50
                              dark:bg-emerald-900/30
                              text-emerald-700
                              dark:text-emerald-300
                              text-xs
                              font-bold
                            "
                          >

                            <CheckCircle2
                              size={14}
                            />

                            {
                              direction.school_name
                            }

                          </span>

                        )
                      )}

                  </div>

                </div>

              )}


              {/* CHOIX ÉCOLE */}

              <label
                htmlFor="director-school"
                className="
                  block
                  text-sm
                  font-bold
                  text-gray-700
                  dark:text-gray-300
                  mb-2
                "
              >
                École concernée
              </label>


              {schoolsLoading ? (

                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-5
                    text-gray-500
                    dark:text-gray-400
                  "
                >

                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Chargement des écoles...

                </div>

              ) : (

                <select
                  id="director-school"
                  value={
                    selectedSchoolId
                  }
                  onChange={
                    (
                      e
                    ) =>
                      setSelectedSchoolId(
                        e.target.value
                          ? Number(
                              e.target.value
                            )
                          : ""
                      )
                  }
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-700
                    bg-white
                    dark:bg-gray-800
                    text-gray-900
                    dark:text-white
                    outline-none
                    focus:ring-2
                    focus:ring-emerald-500
                    focus:border-emerald-500
                  "
                >

                  <option value="">
                    -- Sélectionner une école --
                  </option>


                  {schools
                    .filter(
                      (
                        school
                      ) =>
                        school.is_active !==
                        false
                    )
                    .map(
                      (
                        school
                      ) => (

                        <option
                          key={
                            school.id
                          }
                          value={
                            school.id
                          }
                        >

                          {
                            school.nom
                          }

                          {school.ville
                            ? ` — ${school.ville}`
                            : ""}

                        </option>

                      )
                    )}

                </select>

              )}


              {/* INFORMATION */}

              <div
                className="
                  mt-4
                  p-4
                  rounded-xl
                  bg-gray-50
                  dark:bg-gray-800
                  border
                  border-gray-200
                  dark:border-gray-700
                "
              >

                <p
                  className="
                    flex
                    gap-2
                    text-sm
                    text-gray-600
                    dark:text-gray-300
                  "
                >

                  <ShieldCheck
                    size={18}
                    className="
                      shrink-0
                      text-blue-600
                    "
                  />

                  <span>
                    Le directeur est rattaché à l'école sélectionnée. Cela ne lui donne pas les droits d'administrateur global de CODE.
                  </span>

                </p>

              </div>


              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  gap-3
                  mt-6
                "
              >

                <button
                  type="button"
                  onClick={
                    handleCloseDirectorModal
                  }
                  disabled={
                    directorSaving
                  }
                  className="
                    flex-1
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    dark:border-gray-700
                    text-gray-700
                    dark:text-gray-300
                    hover:bg-gray-50
                    dark:hover:bg-gray-800
                    font-bold
                    transition
                    disabled:opacity-50
                  "
                >
                  Annuler
                </button>


                <button
                  type="button"
                  onClick={
                    handleDesignateDirector
                  }
                  disabled={
                    directorSaving ||
                    !selectedSchoolId ||
                    schoolsLoading
                  }
                  className="
                    flex-1
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-3
                    rounded-xl
                    bg-emerald-600
                    hover:bg-emerald-700
                    text-white
                    font-bold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    shadow-sm
                  "
                >

                  {directorSaving ? (

                    <>

                      <Loader2
                        size={19}
                        className="animate-spin"
                      />

                      Enregistrement...

                    </>

                  ) : (

                    <>

                      <CheckCircle2
                        size={19}
                      />

                      Valider directeur

                    </>

                  )}

                </button>

              </div>

            </motion.div>

          </div>

        )}

      </div>

    </motion.div>

  );

};


export default ListeInscrits;