
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

  // ========================================================
  // 👨‍🏫 STATUT ENSEIGNANT
  // ========================================================

  enseignant?: boolean;

  enseignant_actif?: boolean;

  subjects?: string[];

  // ========================================================
  // 🏫 DIRECTION D'ÉCOLE
  // ========================================================

  directorships?: Directorship[];

  // ========================================================
  // 🏫 ÉCOLES DE L'UTILISATEUR
  // ========================================================

  school_memberships?: UserSchoolMembership[];

  schools?: UserSchoolMembership[];

  ecoles?: UserSchoolMembership[];

  // ========================================================
  // PARRAINAGE
  // ========================================================

  parrain_email: string;

  lieu_naissance?: string;

  filleuls_emails?: string[];

  // ========================================================
  // DOCUMENTS OBTENUS
  // ========================================================

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
  // 🔐 ACCÈS DIRECTEUR
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
  // 🏫 ÉCOLES DU DIRECTEUR
  // ========================================================

  const [
    directorSchools,
    setDirectorSchools,
  ] = useState<Directorship[]>([]);


  // ========================================================
  // 👨‍🏫 ENSEIGNANTS DES ÉCOLES DU DIRECTEUR
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
  // 🏫 ÉTATS GESTION DIRECTEURS
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
  // 🔐 VÉRIFICATION ADMIN / DIRECTEUR
  // ========================================================

  useEffect(() => {

    if (authLoading) {
      return;
    }


    if (!user) {

      navigate("/login");

      return;

    }


    /*
     * L'administrateur CODE possède directement
     * l'autorisation globale.
     */

    if (user.is_admin) {

      setIsDirector(false);
      setDirectorSchools([]);
      setAccessChecking(false);

      return;

    }


    /*
     * Un directeur est également autorisé
     * à accéder à cette page.
     */

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
  // 👨‍🏫 RÉCUPÉRATION DES ENSEIGNANTS
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


        /*
         * Suppression des doublons :
         * un même enseignant peut être présent
         * dans plusieurs écoles, mais pas deux fois
         * dans la même école.
         */

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
  // 👨‍🏫 RECHERCHE DES ÉCOLES D'UN ENSEIGNANT
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
  // 🏫 RÉCUPÉRATION DES ÉCOLES
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
  // 🏫 OUVRIR LA FENÊTRE DIRECTEUR
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
  // 🏫 FERMER LA FENÊTRE DIRECTEUR
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
  // 🏫 DÉSIGNER UN DIRECTEUR
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


      if (
        !confirmation
      ) {

        return;

      }


      setDirectorSaving(
        true
      );


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


                /*
                 * Le backend transforme également
                 * le directeur en enseignant rattaché
                 * à cette école.
                 */

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

        setDirectorSaving(
          false
        );

      }

    };


  // ========================================================
  // 🏫 RETIRER UN DIRECTEUR
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


      if (
        !direction
      ) {

        return;

      }


      const confirmation =
        window.confirm(
          `Voulez-vous retirer ${utilisateur.prenom} ${utilisateur.nom} de la direction de "${direction.school_name}" ?`
        );


      if (
        !confirmation
      ) {

        return;

      }


      setDirectorRemoving(
        schoolId
      );


      try {

        /*
         * NOUVEL ENDPOINT BACKEND :
         *
         * DELETE
         * /api/schools/admin/{school_id}/director
         *
         * Le user_id n'est plus envoyé dans l'URL.
         */

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
  // 👨‍🏫 RETIRER UN ENSEIGNANT DE L'ÉCOLE
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


      if (
        !confirmation
      ) {

        return;

      }


      setTeacherRemoving({
        userId:
          utilisateur.id,

        schoolId,
      });


      try {

        /*
         * NOUVEL ENDPOINT DIRECTEUR :
         *
         * DELETE
         * /api/schools/director/{school_id}/teachers/{user_id}
         */

        const response =
          await api.delete(
            `/api/schools/director/${schoolId}/teachers/${utilisateur.id}`
          );


        /*
         * Suppression locale uniquement
         * de l'association enseignant ↔ école.
         */

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


        /*
         * IMPORTANT :
         *
         * On ne modifie PAS :
         *
         * enseignant
         * enseignant_actif
         *
         * car l'utilisateur peut être enseignant
         * dans une autre école.
         */

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
  // 🔧 UTILITAIRE NORMALISATION UTILISATEUR
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
  // 🏫 AJOUT D'UNE ASSOCIATION ÉCOLE À UN UTILISATEUR
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


      if (
        exists
      ) {

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
  // 🏫 RÉCUPÉRATION DES UTILISATEURS D'UNE ÉCOLE
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


              /*
               * --------------------------------------------------
               * ENSEIGNANTS
               * --------------------------------------------------
               */

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


              /*
               * --------------------------------------------------
               * APPRENANTS
               * --------------------------------------------------
               */

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


      /*
       * Toutes les écoles sont maintenant regroupées.
       */

      const merged =
        schoolResponses.flat();


      /*
       * Un enseignant peut appartenir à plusieurs écoles.
       * Un apprenant peut également être présent dans une
       * réponse provenant de plusieurs sources.
       *
       * On fusionne donc par user_id.
       */

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


          if (
            !existing
          ) {

            usersMap.set(
              current.id,
              current
            );

            return;

          }


          /*
           * Fusion des appartenances scolaires.
           */

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


              if (
                !exists
              ) {

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

              /*
               * Si l'un des résultats indique
               * qu'il est enseignant, on conserve
               * ce statut.
               */

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
  // 📥 RÉCUPÉRATION DES INSCRITS
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

          /*
           * ==================================================
           * ADMIN CODE
           * ==================================================
           *
           * L'administrateur continue d'utiliser
           * l'endpoint global historique.
           */

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

                /*
                 * Ne pas afficher l'administrateur
                 * principal de CODE.
                 */
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


            /*
             * TRI ADMIN
             */

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


          /*
           * ==================================================
           * DIRECTEUR
           * ==================================================
           *
           * IMPORTANT :
           *
           * Un directeur ne doit pas utiliser
           * /api/admin/liste-inscrits.
           *
           * Il récupère uniquement les utilisateurs
           * appartenant à ses écoles.
           */

          if (
            isDirector &&
            directorSchools.length >
              0
          ) {

            const allUsers =
              await fetchDirectorSchoolUsers(
                directorSchools
              );


            /*
             * Ne pas afficher un éventuel compte
             * administrateur global.
             */

            const filteredUsers =
              allUsers.filter(
                (
                  item
                ) =>
                  !item.is_admin
              );


            /*
             * TRI :
             * enseignants puis apprenants,
             * puis nom/prénom.
             */

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


            /*
             * Pagination locale pour le directeur.
             *
             * Le backend nous donne ici les utilisateurs
             * de toutes les écoles dont il a la direction.
             */

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


            /*
             * Si une suppression ou un changement
             * rend la page courante vide, on revient
             * à la dernière page disponible.
             */

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
  // 👨‍🏫 RÉCUPÉRATION DES ENSEIGNANTS DU DIRECTEUR
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


        pages.push(
          1
        );


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

          pages.push(
            p
          );

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
  // NUMÉRO PREMIER ÉLÉMENT
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


  // ========================================================
  // NUMÉRO DERNIER ÉLÉMENT
  // ========================================================

  const endIndex =
    Math.min(
      page *
        PAGE_SIZE,
      totalInscrits
    );


  // ========================================================
  // 🏫 ÉCOLES D'UN UTILISATEUR
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


      /*
       * Pour les administrateurs CODE,
       * on complète également les informations
       * à partir des directions connues.
       */

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
  // 🏫 FORMAT ÉCOLES
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
              italic
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
            min-w-[220px]
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
                    rounded-lg
                    bg-blue-50
                    dark:bg-blue-900/20
                    border
                    border-blue-200
                    dark:border-blue-800
                    p-2
                  "
                >

                  <div
                    className="
                      font-semibold
                      text-blue-700
                      dark:text-blue-300
                    "
                  >

                    🏫{" "}
                    {
                      school.school_name
                    }

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
  // 👨‍🏫 PROF POUR UN DIRECTEUR
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
  // NOMBRE D'INSCRIPTIONS EN ATTENTE
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
  // 👨‍🏫 DÉCLARER UN UTILISATEUR ENSEIGNANT
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


      if (
        !utilisateur
      ) {

        return;

      }


      const confirmation =
        window.confirm(
          `Voulez-vous déclarer ${utilisateur.prenom} ${utilisateur.nom} comme enseignant ?`
        );


      if (
        !confirmation
      ) {

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
  // VALIDATION D'UN INSCRIT
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
  // REFUSER UN INSCRIT
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
  // 🔄 CHARGEMENT
  // ========================================================

  if (
    authLoading ||
    accessChecking
  ) {

    return (

      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          min-h-screen
          gap-3
          text-gray-600
          dark:text-gray-300
        "
      >

        <Loader2
          size={30}
          className="animate-spin"
        />

        Vérification des autorisations...

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
        y: 30,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      exit={{
        opacity: 0,
        y: -30,
      }}

      transition={{
        duration: 0.5,
      }}

      className="
        min-h-screen
        p-6
        bg-gray-100
        dark:bg-gray-900
      "
    >

      {/* ====================================================
          TITRE
      ==================================================== */}

      <h1
        className="
          text-3xl
          font-bold
          text-center
          text-blue-700
          dark:text-white
          mb-4
        "
      >
        {user?.is_admin
          ? "Liste des Apprenants Inscrits"
          : "Utilisateurs de mon école"}
      </h1>


      {/* ====================================================
          INFORMATION DIRECTEUR
      ==================================================== */}

      {isDirector &&
      !user?.is_admin && (

        <div
          className="
            max-w-5xl
            mx-auto
            mb-6
            p-4
            rounded-2xl
            bg-amber-50
            dark:bg-amber-950/30
            border
            border-amber-200
            dark:border-amber-700
          "
        >

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <School
              size={20}
              className="
                text-amber-600
                dark:text-amber-400
              "
            />

            <span
              className="
                font-bold
                text-amber-800
                dark:text-amber-300
              "
            >
              Direction
            </span>

          </div>


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
                    px-3
                    py-1
                    rounded-full
                    bg-white
                    dark:bg-gray-800
                    border
                    border-amber-300
                    dark:border-amber-700
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-gray-200
                  "
                >

                  🏫{" "}
                  {
                    school.school_name
                  }

                </span>

              )
            )}

          </div>

        </div>

      )}


      {/* ====================================================
          COMPTE DES INSCRIPTIONS EN ATTENTE
      ==================================================== */}

      <p
        className="
          text-center
          text-gray-600
          dark:text-gray-300
          mb-4
        "
      >

        Inscriptions en attente :{" "}

        <span
          className="font-semibold"
        >
          {pendingCount}
        </span>

      </p>


      {/* ====================================================
          CHARGEMENT
      ==================================================== */}

      {loadingListe &&
      inscrits.length ===
        0 ? (

        <p
          className="
            text-center
            mt-8
            text-gray-600
            dark:text-gray-300
          "
        >
          Chargement...

        </p>

      ) : inscrits.length ===
        0 ? (

        <p
          className="
            text-center
            text-gray-600
            dark:text-gray-300
          "
        >
          Aucun inscrit pour le moment.
        </p>

      ) : (

        <>

          {/* ==================================================
              TABLEAU
          ================================================== */}

          <div
            className="
              overflow-x-auto
              mb-6
            "
          >

            <table
              className="
                min-w-full
                bg-white
                dark:bg-gray-800
                rounded-xl
                shadow-md
              "
            >

              {/* =================================================
                  EN-TÊTE ADMIN
              ================================================= */}

              {user?.is_admin ? (

                <thead>

                  <tr
                    className="
                      bg-blue-600
                      text-white
                    "
                  >

                    <th className="px-4 py-2">
                      Nom
                    </th>

                    <th className="px-4 py-2">
                      Prénom
                    </th>

                    <th className="px-4 py-2">
                      Email
                    </th>

                    <th className="px-4 py-2">
                      Parrain
                    </th>

                    <th className="px-4 py-2">
                      Filleuls
                    </th>

                    <th className="px-4 py-2">
                      Téléphone
                    </th>

                    <th className="px-4 py-2">
                      Date inscription
                    </th>

                    <th className="px-4 py-2">
                      Statut
                    </th>

                    <th className="px-4 py-2">
                      Blocage
                    </th>

                    <th className="px-4 py-2">
                      Enseignant
                    </th>

                    <th
                      className="
                        px-4
                        py-2
                        min-w-[240px]
                      "
                    >
                      Directeur
                    </th>

                    <th
                      className="
                        px-4
                        py-2
                        min-w-[260px]
                      "
                    >
                      École
                    </th>

                    <th className="px-4 py-2">
                      Actions
                    </th>

                    <th
                      className="
                        px-4
                        py-2
                        min-w-[280px]
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

                    <th className="px-4 py-2">
                      Nom
                    </th>

                    <th className="px-4 py-2">
                      Prénom
                    </th>

                    <th className="px-4 py-2">
                      Email
                    </th>

                    <th className="px-4 py-2">
                      Téléphone
                    </th>

                    <th className="px-4 py-2">
                      Date inscription
                    </th>

                    <th className="px-4 py-2">
                      Statut
                    </th>

                    <th className="px-4 py-2">
                      Blocage
                    </th>

                    <th
                      className="
                        px-4
                        py-2
                        min-w-[220px]
                      "
                    >
                      Prof
                    </th>

                    <th className="px-4 py-2">
                      Act
                    </th>

                    <th
                      className="
                        px-4
                        py-2
                        min-w-[280px]
                      "
                    >
                      Documents
                    </th>

                  </tr>

                </thead>

              )}


              {/* =================================================
                  CORPS DU TABLEAU
              ================================================= */}

              <tbody>

                {inscrits.map(
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
                          dark:border-gray-700
                          hover:bg-gray-100
                          dark:hover:bg-gray-700
                        "
                      >

                        {/* ======================================
                            NOM
                        ====================================== */}

                        <td className="px-4 py-2">

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              whitespace-nowrap
                            "
                          >

                            <span
                              className="
                                font-semibold
                              "
                            >
                              {
                                i.nom
                              }
                            </span>


                            {nombreDocuments >
                              0 && (

                              <span
                                className="
                                  text-yellow-500
                                  text-lg
                                  tracking-tight
                                  cursor-help
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

                                {"🔑".repeat(
                                  nombreDocuments
                                )}

                              </span>

                            )}


                            {i.is_online ? (

                              <span
                                className="
                                  px-2
                                  py-0.5
                                  bg-green-500
                                  text-white
                                  rounded-full
                                  text-xs
                                "
                              >
                                Connecté
                              </span>

                            ) : (

                              <span
                                className="
                                  px-2
                                  py-0.5
                                  bg-red-500
                                  text-white
                                  rounded-full
                                  text-xs
                                "
                              >
                                Déconnecté
                              </span>

                            )}

                          </div>

                        </td>


                        {/* ======================================
                            PRÉNOM
                        ====================================== */}

                        <td className="px-4 py-2">
                          {
                            i.prenom
                          }
                        </td>


                        {/* ======================================
                            EMAIL
                        ====================================== */}

                        <td className="px-4 py-2">
                          {
                            i.email
                          }
                        </td>


                        {/* =================================================
                            COLONNES ADMIN UNIQUEMENT
                        ================================================= */}

                        {user?.is_admin && (

                          <>

                            <td className="px-4 py-2">

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
                                    text-blue-600
                                    hover:underline
                                  "
                                >
                                  {
                                    i.parrain_email
                                  }
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


                            <td className="px-4 py-2">

                              {i.filleuls_emails &&
                              i.filleuls_emails.length >
                                0 ? (

                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-1
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
                                          text-blue-600
                                          hover:underline
                                          text-sm
                                        "
                                      >
                                        {
                                          mail
                                        }
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


                        {/* ======================================
                            TÉLÉPHONE
                        ====================================== */}

                        <td className="px-4 py-2">
                          {
                            i.telephone ||
                            "-"
                          }
                        </td>


                        {/* ======================================
                            DATE
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.date_inscription
                            ? new Date(
                                i.date_inscription
                              ).toLocaleDateString()
                            : "-"}

                        </td>


                        {/* ======================================
                            STATUT
                        ====================================== */}

                        <td className="px-4 py-2">

                          {i.status ===
                            "validated" &&
                            "✅ Validé"}

                          {i.status ===
                            "pending" &&
                            "⏳ En attente"}

                          {i.status ===
                            "refused" &&
                            "❌ Refusé"}

                        </td>


                        {/* ======================================
                            BLOCAGE
                        ====================================== */}

                        <td
                          className="
                            px-4
                            py-2
                            text-center
                          "
                        >

                          {i.is_blocked ? (

                            <span
                              className="
                                text-red-600
                                font-semibold
                              "
                            >
                              🚫 Bloqué
                            </span>

                          ) : (

                            <span
                              className="
                                text-green-600
                                font-semibold
                              "
                            >
                              ✅ Actif
                            </span>

                          )}

                        </td>


                        {/* =================================================
                            👨‍🏫 ENSEIGNANT — ADMIN UNIQUEMENT
                        ================================================= */}

                        {user?.is_admin && (

                          <td
                            className="
                              px-4
                              py-2
                              text-center
                            "
                          >

                            {i.enseignant ? (

                              <div
                                className="
                                  flex
                                  flex-col
                                  items-center
                                  gap-1
                                "
                              >

                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    px-3
                                    py-1
                                    rounded-full
                                    bg-indigo-100
                                    text-indigo-700
                                    dark:bg-indigo-900/40
                                    dark:text-indigo-300
                                    text-sm
                                    font-semibold
                                    whitespace-nowrap
                                  "
                                >
                                  👨‍🏫 Enseignant
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
                                  px-3
                                  py-1
                                  bg-indigo-600
                                  text-white
                                  rounded-xl
                                  hover:bg-indigo-700
                                  transition
                                  font-semibold
                                  whitespace-nowrap
                                "
                              >
                                👨‍🏫 Déclarer enseignant
                              </button>

                            )}

                          </td>

                        )}


                        {/* =================================================
                            🏫 DIRECTEUR — ADMIN UNIQUEMENT
                        ================================================= */}

                        {user?.is_admin && (

                          <td
                            className="
                              px-4
                              py-2
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
                                        dark:border-emerald-700
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
                                          font-semibold
                                          text-sm
                                        "
                                      >

                                        <School
                                          size={
                                            18
                                          }
                                        />

                                        <span>
                                          Directeur
                                        </span>

                                      </div>


                                      <div
                                        className="
                                          mt-1
                                          text-sm
                                          text-gray-700
                                          dark:text-gray-300
                                          font-medium
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
                                          mt-2
                                          px-3
                                          py-1
                                          text-xs
                                          font-semibold
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

                                          <span
                                            className="
                                              flex
                                              items-center
                                              gap-1
                                            "
                                          >

                                            <Loader2
                                              size={
                                                14
                                              }
                                              className="
                                                animate-spin
                                              "
                                            />

                                            Retrait...

                                          </span>

                                        ) : (

                                          "Retirer directeur"

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
                                    px-3
                                    py-1
                                    rounded-xl
                                    border
                                    border-emerald-600
                                    text-emerald-700
                                    dark:text-emerald-300
                                    hover:bg-emerald-50
                                    dark:hover:bg-emerald-900/20
                                    font-semibold
                                    text-sm
                                    transition
                                    whitespace-nowrap
                                  "
                                >
                                  + Ajouter une école
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
                                  py-2
                                  bg-emerald-600
                                  text-white
                                  rounded-xl
                                  hover:bg-emerald-700
                                  transition
                                  font-semibold
                                  whitespace-nowrap
                                "
                              >

                                <UserCheck
                                  size={
                                    17
                                  }
                                />

                                Désigner directeur

                              </button>

                            )}

                          </td>

                        )}


                        {/* =================================================
                            🏫 ÉCOLE — ADMIN UNIQUEMENT
                        ================================================= */}

                        {user?.is_admin && (

                          <td
                            className="
                              px-4
                              py-2
                            "
                          >

                            {renderUserSchools(
                              i
                            )}

                          </td>

                        )}


                        {/* =================================================
                            ACTIONS — ADMIN UNIQUEMENT
                        ================================================= */}

                        {user?.is_admin && (

                          <td className="px-4 py-2">

                            {i.status ===
                            "pending" ? (

                              <div
                                className="
                                  flex
                                  gap-2
                                "
                              >

                                <button
                                  onClick={() =>
                                    handleValider(
                                      i.id
                                    )
                                  }
                                  className="
                                    px-3
                                    py-1
                                    bg-green-600
                                    text-white
                                    rounded-xl
                                    hover:bg-green-700
                                    transition
                                  "
                                >
                                  Valider
                                </button>


                                <button
                                  onClick={() =>
                                    handleRefuser(
                                      i.id
                                    )
                                  }
                                  className="
                                    px-3
                                    py-1
                                    bg-red-600
                                    text-white
                                    rounded-xl
                                    hover:bg-red-700
                                    transition
                                  "
                                >
                                  Refuser
                                </button>

                              </div>

                            ) : (

                              <div
                                className="
                                  flex
                                  gap-2
                                "
                              >

                                <button
                                  onClick={() =>
                                    handleBlock(
                                      i.id,
                                      i.is_blocked
                                    )
                                  }
                                  className={`
                                    px-3
                                    py-1
                                    rounded-xl
                                    text-white
                                    transition
                                    ${
                                      i.is_blocked
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    }
                                  `}
                                >

                                  {i.is_blocked
                                    ? "Réactiver"
                                    : "Bloquer"}

                                </button>

                              </div>

                            )}

                          </td>

                        )}


                        {/* =================================================
                            👨‍🏫 PROF — DIRECTEUR UNIQUEMENT
                        ================================================= */}

                        {isDirector &&
                        !user?.is_admin && (

                          <td
                            className="
                              px-4
                              py-2
                              text-center
                            "
                          >

                            {directorTeachersLoading ? (

                              <Loader2
                                size={
                                  18
                                }
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
                                        gap-1
                                        px-3
                                        py-1
                                        rounded-full
                                        bg-indigo-100
                                        text-indigo-700
                                        dark:bg-indigo-900/40
                                        dark:text-indigo-300
                                        text-sm
                                        font-semibold
                                      "
                                    >

                                      👨‍🏫 Prof

                                      <span
                                        className="
                                          text-xs
                                          font-normal
                                        "
                                      >
                                        {teacherSchool.school_name
                                          ? ` — ${teacherSchool.school_name}`
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


                        {/* =================================================
                            ⚙️ ACT — DIRECTEUR UNIQUEMENT
                        ================================================= */}

                        {isDirector &&
                        !user?.is_admin && (

                          <td
                            className="
                              px-4
                              py-2
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
                                        font-semibold
                                        text-sm
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
                                            size={
                                              16
                                            }
                                            className="
                                              animate-spin
                                            "
                                          />

                                          Retrait...

                                        </>

                                      ) : (

                                        <>

                                          <UserMinus
                                            size={
                                              16
                                            }
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


                        {/* =================================================
                            DOCUMENTS
                        ================================================= */}

                        <td className="px-4 py-2">

                          {nombreDocuments >
                          0 ? (

                            <div
                              className="
                                flex
                                flex-col
                                gap-2
                                min-w-[250px]
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
                                      p-2
                                      rounded-lg
                                      bg-purple-50
                                      dark:bg-purple-900/30
                                      border
                                      border-purple-200
                                      dark:border-purple-700
                                    "
                                  >

                                    <div
                                      className="
                                        font-semibold
                                        text-purple-700
                                        dark:text-purple-300
                                      "
                                    >

                                      📚{" "}
                                      {
                                        document.document_name
                                      }

                                    </div>


                                    <div
                                      className="
                                        text-sm
                                        text-gray-700
                                        dark:text-gray-300
                                        mt-1
                                      "
                                    >

                                      🔑 Code :{" "}

                                      <span
                                        className="
                                          font-mono
                                          font-semibold
                                        "
                                      >
                                        {
                                          document.activation_code
                                        }
                                      </span>

                                    </div>


                                    <div
                                      className="
                                        text-sm
                                        mt-1
                                      "
                                    >

                                      {document.is_activated ? (

                                        <span
                                          className="
                                            text-green-600
                                            font-semibold
                                          "
                                        >
                                          ✅ Activé
                                        </span>

                                      ) : (

                                        <span
                                          className="
                                            text-orange-600
                                            font-semibold
                                          "
                                        >
                                          ⏳ Non activé
                                        </span>

                                      )}

                                    </div>


                                    {document.activated_at && (

                                      <div
                                        className="
                                          text-xs
                                          text-gray-500
                                          mt-1
                                        "
                                      >

                                        Activé le :{" "}

                                        {new Date(
                                          document.activated_at
                                        ).toLocaleString()}

                                      </div>

                                    )}

                                  </div>

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


            {/* ==================================================
                CHARGEMENT
            ================================================== */}

            {loadingListe &&
            inscrits.length >
              0 && (

              <p
                className="
                  text-center
                  mt-4
                  text-gray-600
                  dark:text-gray-300
                "
              >
                Chargement...
              </p>

            )}

          </div>


          {/* ==================================================
              INFORMATIONS PAGINATION
          ================================================== */}

          {totalInscrits >
            0 && (

            <div
              className="
                text-center
                text-sm
                text-gray-600
                dark:text-gray-300
                mb-4
              "
            >

              Affichage de{" "}

              <span
                className="font-semibold"
              >
                {startIndex}
              </span>

              {" "}à{" "}

              <span
                className="font-semibold"
              >
                {endIndex}
              </span>

              {" "}sur{" "}

              <span
                className="font-semibold"
              >
                {totalInscrits}
              </span>

              {" "}inscrit(s).

              <div className="mt-1">

                Page{" "}

                <span
                  className="font-semibold"
                >
                  {page}
                </span>

                {" "}sur{" "}

                <span
                  className="font-semibold"
                >
                  {totalPages}
                </span>

              </div>

            </div>

          )}


          {/* ==================================================
              PAGINATION
          ================================================== */}

          {totalPages >
            1 && (

            <div
              className="
                flex
                flex-wrap
                justify-center
                items-center
                gap-2
                mt-6
                mb-8
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
                className={`
                  px-4
                  py-2
                  rounded-xl
                  font-semibold
                  transition
                  ${
                    page ===
                      1 ||
                    loadingListe
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                ← Précédent
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
                            px-2
                            text-gray-500
                            dark:text-gray-400
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
                          min-w-[42px]
                          px-3
                          py-2
                          rounded-xl
                          font-semibold
                          transition
                          ${
                            page ===
                            pageNumber
                              ? "bg-blue-700 text-white shadow-md"
                              : "bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-300 dark:border-blue-700"
                          }
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
                className={`
                  px-4
                  py-2
                  rounded-xl
                  font-semibold
                  transition
                  ${
                    page ===
                      totalPages ||
                    loadingListe
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }
                `}
              >
                Suivant →
              </button>

            </div>

          )}

        </>

      )}


      {/* ====================================================
          BOUTONS ADMINISTRATION
      ==================================================== */}

      {user?.is_admin && (

        <div
          className="
            flex
            flex-col
            items-center
            space-y-4
            mt-6
          "
        >

          {/* ==================================================
              GESTION DOCUMENTS
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/documents"
              )
            }
            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-purple-600
              text-white
              hover:bg-purple-700
              transition
              w-64
              text-center
            "
          >
            📚 GESTION DES DOCUMENTS
          </button>


          {/* ==================================================
              GESTION ENSEIGNANTS
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/enseignants"
              )
            }
            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-indigo-600
              text-white
              hover:bg-indigo-700
              transition
              w-64
              text-center
            "
          >
            👨‍🏫 GESTION DES ENSEIGNANTS
          </button>


          {/* ==================================================
              GESTION ÉCOLES
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/ecoles"
              )
            }
            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-emerald-600
              text-white
              hover:bg-emerald-700
              transition
              w-64
              text-center
            "
          >
            🏫 GESTION DES ÉCOLES
          </button>


          {/* ==================================================
              GESTION PROJETS
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/projets"
              )
            }
            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-cyan-600
              text-white
              hover:bg-cyan-700
              transition
              w-64
              text-center
            "
          >
            💡 GESTION DES PROJETS
          </button>


          {/* ==================================================
              CODES ACTIVATION
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/codes-activation"
              )
            }
            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-orange-600
              text-white
              hover:bg-orange-700
              transition
              w-64
              text-center
            "
          >
            🔑 CODES D'ACTIVATION
          </button>


          {/* ==================================================
              HISTORIQUE
          ================================================== */}

          <button
            onClick={() =>
              navigate(
                "/admin/historique-connections"
              )
            }
            className="
              px-6
              py-3
              font-semibold
              rounded-xl
              bg-green-600
              text-white
              hover:bg-green-700
              transition
              w-64
              text-center
            "
          >
            Voir l'historique des connexions
          </button>


          {/* ==================================================
              CONTINUER
          ================================================== */}

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
              px-6
              py-3
              font-semibold
              rounded-xl
              transition
              w-64
              text-center
              ${
                pendingCount >
                0
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }
            `}
          >
            CONTINUER
          </button>


          {/* ==================================================
              AVERTISSEMENT
          ================================================== */}

          {pendingCount >
            0 && (

            <p
              className="
                text-sm
                text-red-600
                mt-2
                text-center
              "
            >
              ⚠️ Vous devez traiter toutes
              les inscriptions avant de
              continuer.
            </p>

          )}


          {/* ==================================================
              CONVERSATIONS ADMIN
          ================================================== */}

          <div
            className="
              w-full
              flex
              justify-center
              mt-8
              pt-6
              border-t
              border-gray-300
              dark:border-gray-700
            "
          >

            <button
              onClick={() =>
                navigate(
                  "/admin/questions"
                )
              }
              className="
                px-6
                py-3
                font-semibold
                rounded-xl
                bg-indigo-600
                text-white
                hover:bg-indigo-700
                transition
                w-64
                text-center
                shadow-md
              "
            >
              💬 CONVERSATIONS ADMIN
            </button>

          </div>

        </div>

      )}


      {/* ====================================================
          🏫 MODALE DÉSIGNATION DIRECTEUR
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

          <div
            className="
              relative
              w-full
              max-w-lg
              bg-white
              dark:bg-gray-900
              rounded-2xl
              shadow-2xl
              p-6
            "
          >

            {/* ==================================================
                FERMER
            ================================================== */}

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
                p-2
                rounded-full
                hover:bg-gray-100
                dark:hover:bg-gray-800
                transition
                disabled:opacity-50
              "
              aria-label="Fermer"
            >

              <X
                size={
                  22
                }
              />

            </button>


            {/* ==================================================
                TITRE
            ================================================== */}

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
                  p-3
                  rounded-xl
                  bg-emerald-100
                  dark:bg-emerald-900/30
                "
              >

                <School
                  size={
                    26
                  }
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
                    font-bold
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


            {/* ==================================================
                UTILISATEUR
            ==================================================== */}

            <div
              className="
                p-4
                rounded-xl
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

                <UserCheck
                  size={
                    24
                  }
                  className="
                    text-blue-600
                  "
                />

                <div>

                  <p
                    className="
                      font-bold
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
                    "
                  >
                    {
                      selectedDirector.email
                    }
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                ÉCOLES DÉJÀ ASSOCIÉES
            ================================================== */}

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
                    font-semibold
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
                            gap-1
                            px-3
                            py-1
                            rounded-full
                            bg-emerald-100
                            dark:bg-emerald-900/30
                            text-emerald-700
                            dark:text-emerald-300
                            text-sm
                            font-semibold
                          "
                        >

                          <CheckCircle2
                            size={
                              15
                            }
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


            {/* ==================================================
                CHOIX ÉCOLE
            ================================================== */}

            <label
              htmlFor="director-school"
              className="
                block
                text-sm
                font-semibold
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
                  py-4
                  text-gray-500
                "
              >

                <Loader2
                  size={
                    20
                  }
                  className="
                    animate-spin
                  "
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
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-500
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


            {/* ==================================================
                AVERTISSEMENT
            ================================================== */}

            <div
              className="
                mt-4
                p-3
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
                  text-sm
                  text-gray-600
                  dark:text-gray-300
                "
              >

                ℹ️ Le directeur est rattaché
                à l'école sélectionnée. Cela
                ne lui donne pas les droits
                d'administrateur global de
                CODE.

              </p>

            </div>


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div
              className="
                flex
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
                  font-semibold
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
                  font-semibold
                  transition
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >

                {directorSaving ? (

                  <>

                    <Loader2
                      size={
                        19
                      }
                      className="
                        animate-spin
                      "
                    />

                    Enregistrement...

                  </>

                ) : (

                  <>

                    <CheckCircle2
                      size={
                        19
                      }
                    />

                    Valider directeur

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </motion.div>

  );

};


export default ListeInscrits;

