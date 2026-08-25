import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

// ==========================================================
// TYPES
// ==========================================================

interface ConnexionJour {
  date: string;
  count: number;
}

interface ConnexionHeure {
  hour: string;
  count: number;
}

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  total_minutes?: number;
}

// ==========================================================
// DASHBOARD
// ==========================================================

export default function Dashboard() {
  const navigate = useNavigate();

  const [connexionsJour, setConnexionsJour] = useState<
    ConnexionJour[]
  >([]);

  const [connexionsHeure, setConnexionsHeure] = useState<
    ConnexionHeure[]
  >([]);

  const [elevesEnLigne, setElevesEnLigne] = useState<
    Eleve[]
  >([]);

  const [elevesActifs, setElevesActifs] = useState<
    Eleve[]
  >([]);

  const [tempsMoyen, setTempsMoyen] =
    useState<number>(0);

  const [refreshing, setRefreshing] =
    useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ==========================================================
  // CHARGEMENT DES DONNÉES
  // ==========================================================

  const chargerDonnees = async () => {
    try {
      setRefreshing(true);

      // ------------------------------------------------------
      // CONNEXIONS PAR JOUR
      // ------------------------------------------------------

      const connexionsJourResponse =
        await axios.get<Record<string, number>>(
          "/api/admin_dashboard/connexions-par-jour?days=7",
          { headers }
        );

      const dataJour: ConnexionJour[] =
        Object.entries(
          connexionsJourResponse.data
        ).map(([date, count]) => ({
          date,
          count,
        }));

      setConnexionsJour(dataJour);

      // ------------------------------------------------------
      // CONNEXIONS PAR HEURE
      // ------------------------------------------------------

      const connexionsHeureResponse =
        await axios.get<Record<string, number>>(
          "/api/admin_dashboard/connexions-par-heure",
          { headers }
        );

      const dataHeure: ConnexionHeure[] =
        Object.entries(
          connexionsHeureResponse.data
        ).map(([hour, count]) => ({
          hour,
          count,
        }));

      setConnexionsHeure(dataHeure);

      // ------------------------------------------------------
      // TEMPS MOYEN
      // ------------------------------------------------------

      const tempsResponse =
        await axios.get<{ avg_minutes: number }>(
          "/api/admin_dashboard/temps-moyen-eleve",
          { headers }
        );

      setTempsMoyen(
        tempsResponse.data.avg_minutes || 0
      );

      // ------------------------------------------------------
      // ÉLÈVES LES PLUS ACTIFS
      // ------------------------------------------------------

      const actifsResponse = await axios.get(
        "/api/admin_dashboard/eleves-plus-actifs",
        { headers }
      );

      const actifsData = Array.isArray(
        actifsResponse.data
      )
        ? actifsResponse.data
        : Array.isArray(
            actifsResponse.data?.eleves
          )
        ? actifsResponse.data.eleves
        : Array.isArray(
            actifsResponse.data?.data
          )
        ? actifsResponse.data.data
        : [];

      setElevesActifs(actifsData);
    } catch (error) {
      console.error(
        "Erreur chargement dashboard :",
        error
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================================
  // CHARGEMENT INITIAL
  // ==========================================================

  useEffect(() => {
    chargerDonnees();
  }, [token]);

  // ==========================================================
  // ÉLÈVES EN LIGNE
  // ==========================================================

  useEffect(() => {
    const fetchEleves = () => {
      axios
        .get(
          "/api/admin_dashboard/eleves-en-ligne",
          { headers }
        )
        .then((res) => {
          console.log(
            "🔎 Élèves en ligne :",
            res.data
          );

          const data = Array.isArray(
            res.data
          )
            ? res.data
            : Array.isArray(
                res.data?.eleves
              )
            ? res.data.eleves
            : Array.isArray(
                res.data?.data
              )
            ? res.data.data
            : [];

          setElevesEnLigne(data);
        })
        .catch((err) => {
          console.error(
            "Erreur récupération élèves en ligne :",
            err
          );

          setElevesEnLigne([]);
        });
    };

    fetchEleves();

    const interval = setInterval(
      fetchEleves,
      30000
    );

    return () =>
      clearInterval(interval);
  }, [token]);

  // ==========================================================
  // RETOUR
  // ==========================================================

  const handleRetour = () => {
    navigate(-1);
  };

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-100
        dark:bg-gray-950
        text-slate-900
        dark:text-white
        transition-colors
        duration-300
        p-4
        sm:p-6
        lg:p-8
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* ==================================================
            EN-TÊTE
        ================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-8
          "
        >

          {/* GAUCHE */}

          <div className="flex items-center gap-4">

            <button
              onClick={handleRetour}
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-white
                dark:bg-gray-900
                border
                border-slate-200
                dark:border-gray-700
                shadow-sm
                hover:shadow-md
                hover:-translate-x-1
                transition
                duration-200
                text-slate-700
                dark:text-gray-200
              "
            >
              <span className="text-xl">
                ←
              </span>

              <span className="font-medium">
                Retour
              </span>
            </button>

            <div>

              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-extrabold
                  tracking-tight
                "
              >
                Dashboard Admin CODE
              </h1>

              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-gray-400
                  mt-1
                "
              >
                Vue d'ensemble de l'activité
                de la plateforme.
              </p>

            </div>

          </div>

          {/* DROITE */}

          <button
            onClick={chargerDonnees}
            disabled={refreshing}
            className="
              flex
              items-center
              justify-center
              gap-2
              px-5
              py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-blue-400
              text-white
              font-semibold
              shadow-md
              hover:shadow-lg
              transition
            "
          >
            <span
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            >
              ↻
            </span>

            {refreshing
              ? "Actualisation..."
              : "Actualiser"}
          </button>

        </div>

        {/* ==================================================
            CARTES STATISTIQUES
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
            mb-8
          "
        >

          {/* ÉLÈVES EN LIGNE */}

          <div
            className="
              bg-white
              dark:bg-gray-900
              rounded-2xl
              p-6
              shadow-sm
              border
              border-slate-200
              dark:border-gray-800
              hover:shadow-lg
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <p
                  className="
                    text-sm
                    text-slate-500
                    dark:text-gray-400
                  "
                >
                  Élèves en ligne
                </p>

                <p className="text-3xl font-bold mt-2">
                  {elevesEnLigne.length}
                </p>

              </div>

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-green-100
                  dark:bg-green-900/30
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                🟢
              </div>

            </div>

            <div
              className="
                mt-4
                text-xs
                text-green-600
                dark:text-green-400
                font-medium
              "
            >
              ● Activité en temps réel
            </div>

          </div>

          {/* TEMPS MOYEN */}

          <div
            className="
              bg-white
              dark:bg-gray-900
              rounded-2xl
              p-6
              shadow-sm
              border
              border-slate-200
              dark:border-gray-800
              hover:shadow-lg
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <p
                  className="
                    text-sm
                    text-slate-500
                    dark:text-gray-400
                  "
                >
                  Temps moyen
                </p>

                <p className="text-3xl font-bold mt-2">
                  {tempsMoyen}
                  <span className="text-lg ml-1">
                    min
                  </span>
                </p>

              </div>

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-blue-100
                  dark:bg-blue-900/30
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                ⏱️
              </div>

            </div>

            <div
              className="
                mt-4
                text-xs
                text-slate-500
                dark:text-gray-400
              "
            >
              Temps moyen d'utilisation
            </div>

          </div>

          {/* ÉLÈVES ACTIFS */}

          <div
            className="
              bg-white
              dark:bg-gray-900
              rounded-2xl
              p-6
              shadow-sm
              border
              border-slate-200
              dark:border-gray-800
              hover:shadow-lg
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <p
                  className="
                    text-sm
                    text-slate-500
                    dark:text-gray-400
                  "
                >
                  Élèves actifs
                </p>

                <p className="text-3xl font-bold mt-2">
                  {elevesActifs.length}
                </p>

              </div>

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-100
                  dark:bg-purple-900/30
                  flex
                  items-center
                  justify-center
                  text-2xl
                "
              >
                🏆
              </div>

            </div>

            <div
              className="
                mt-4
                text-xs
                text-slate-500
                dark:text-gray-400
              "
            >
              Utilisateurs les plus engagés
            </div>

          </div>

        </div>

        {/* ==================================================
            GRAPHIQUES
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
            mb-8
          "
        >

          {/* CONNEXIONS PAR JOUR */}

          <div
            className="
              bg-white
              dark:bg-gray-900
              rounded-2xl
              p-5
              sm:p-6
              shadow-sm
              border
              border-slate-200
              dark:border-gray-800
            "
          >

            <div className="mb-5">

              <h2 className="text-lg font-bold">
                Connexions par jour
              </h2>

              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-gray-400
                  mt-1
                "
              >
                Activité des 7 derniers jours
              </p>

            </div>

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <LineChart
                data={connexionsJour}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

          {/* CONNEXIONS PAR HEURE */}

          <div
            className="
              bg-white
              dark:bg-gray-900
              rounded-2xl
              p-5
              sm:p-6
              shadow-sm
              border
              border-slate-200
              dark:border-gray-800
            "
          >

            <div className="mb-5">

              <h2 className="text-lg font-bold">
                Connexions par heure
              </h2>

              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-gray-400
                  mt-1
                "
              >
                Activité enregistrée aujourd'hui
              </p>

            </div>

            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={connexionsHeure}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  radius={[
                    6,
                    6,
                    0,
                    0
                  ]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </div>

        {/* ==================================================
            ÉLÈVES EN LIGNE
        ================================================== */}

        <div
          className="
            bg-white
            dark:bg-gray-900
            rounded-2xl
            shadow-sm
            border
            border-slate-200
            dark:border-gray-800
            mb-8
            overflow-hidden
          "
        >

          <div
            className="
              px-6
              py-5
              border-b
              border-slate-200
              dark:border-gray-800
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h2 className="text-lg font-bold">
                Élèves connectés maintenant
              </h2>

              <p
                className="
                  text-sm
                  text-slate-500
                  dark:text-gray-400
                  mt-1
                "
              >
                Utilisateurs actuellement actifs
              </p>

            </div>

            <div
              className="
                px-3
                py-1
                rounded-full
                bg-green-100
                dark:bg-green-900/30
                text-green-700
                dark:text-green-400
                text-sm
                font-semibold
              "
            >
              {elevesEnLigne.length} en ligne
            </div>

          </div>

          <div className="p-6">

            {elevesEnLigne.length === 0 ? (

              <div
                className="
                  py-10
                  text-center
                  text-slate-500
                  dark:text-gray-400
                "
              >

                <div className="text-4xl mb-3">
                  👤
                </div>

                <p>
                  Aucun élève en ligne pour le moment.
                </p>

              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-4
                  max-h-96
                  overflow-y-auto
                "
              >

                {elevesEnLigne.map((e) => (

                  <div
                    key={e.id}
                    className="
                      flex
                      items-center
                      gap-3
                      p-4
                      rounded-xl
                      bg-slate-50
                      dark:bg-gray-800
                      border
                      border-slate-100
                      dark:border-gray-700
                      hover:shadow-md
                      transition
                    "
                  >

                    <div
                      className="
                        w-10
                        h-10
                        rounded-full
                        bg-blue-100
                        dark:bg-blue-900/40
                        flex
                        items-center
                        justify-center
                        font-bold
                        text-blue-700
                        dark:text-blue-300
                      "
                    >
                      {e.prenom?.charAt(0)}
                      {e.nom?.charAt(0)}
                    </div>

                    <div className="min-w-0">

                      <p className="font-semibold truncate">
                        {e.nom} {e.prenom}
                      </p>

                      <p
                        className="
                          text-xs
                          text-slate-500
                          dark:text-gray-400
                          truncate
                        "
                      >
                        {e.email}
                      </p>

                    </div>

                    <span
                      className="
                        ml-auto
                        w-3
                        h-3
                        rounded-full
                        bg-green-500
                        flex-shrink-0
                      "
                    />

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* ==================================================
            ÉLÈVES LES PLUS ACTIFS
        ================================================== */}

        <div
          className="
            bg-white
            dark:bg-gray-900
            rounded-2xl
            shadow-sm
            border
            border-slate-200
            dark:border-gray-800
            overflow-hidden
          "
        >

          <div
            className="
              px-6
              py-5
              border-b
              border-slate-200
              dark:border-gray-800
            "
          >

            <h2 className="text-lg font-bold">
              🏆 Élèves les plus actifs
            </h2>

            <p
              className="
                text-sm
                text-slate-500
                dark:text-gray-400
                mt-1
              "
            >
              Classement selon le temps passé
              sur CODE.
            </p>

          </div>

          <div className="p-6">

            {elevesActifs.length === 0 ? (

              <div
                className="
                  py-10
                  text-center
                  text-slate-500
                  dark:text-gray-400
                "
              >

                <div className="text-4xl mb-3">
                  📊
                </div>

                <p>
                  Aucun élève actif pour le moment.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {elevesActifs.map(
                  (e, index) => (

                    <div
                      key={e.id}
                      className="
                        flex
                        items-center
                        gap-4
                        p-4
                        rounded-xl
                        bg-slate-50
                        dark:bg-gray-800
                        border
                        border-slate-100
                        dark:border-gray-700
                        hover:shadow-md
                        transition
                      "
                    >

                      {/* RANG */}

                      <div
                        className="
                          w-9
                          h-9
                          rounded-full
                          flex
                          items-center
                          justify-center
                          font-bold
                          bg-blue-100
                          dark:bg-blue-900/40
                          text-blue-700
                          dark:text-blue-300
                          flex-shrink-0
                        "
                      >
                        {index + 1}
                      </div>

                      {/* AVATAR */}

                      <div
                        className="
                          w-11
                          h-11
                          rounded-full
                          bg-purple-100
                          dark:bg-purple-900/40
                          flex
                          items-center
                          justify-center
                          font-bold
                          text-purple-700
                          dark:text-purple-300
                          flex-shrink-0
                        "
                      >
                        {e.prenom?.charAt(0)}
                        {e.nom?.charAt(0)}
                      </div>

                      {/* INFORMATIONS */}

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold truncate">
                          {e.nom} {e.prenom}
                        </p>

                        <p
                          className="
                            text-sm
                            text-slate-500
                            dark:text-gray-400
                            truncate
                          "
                        >
                          {e.email}
                        </p>

                      </div>

                      {/* TEMPS */}

                      <div
                        className="
                          text-right
                          flex-shrink-0
                        "
                      >

                        <p
                          className="
                            font-bold
                            text-blue-600
                            dark:text-blue-400
                          "
                        >
                          {e.total_minutes ?? 0}
                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-500
                            dark:text-gray-400
                          "
                        >
                          minutes
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* ==================================================
            PIED
        ================================================== */}

        <div
          className="
            text-center
            text-xs
            text-slate-400
            dark:text-gray-600
            mt-8
            pb-4
          "
        >
          CODE — Tableau de bord administrateur
        </div>

      </div>
    </div>
  );
}