import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

// Types pour les données
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
  total_minutes?: number; // pour élèves les plus actifs
}

export default function Dashboard() {
  const [connexionsJour, setConnexionsJour] = useState<ConnexionJour[]>([]);
  const [connexionsHeure, setConnexionsHeure] = useState<ConnexionHeure[]>([]);
  const [elevesEnLigne, setElevesEnLigne] = useState<Eleve[]>([]);
  const [elevesActifs, setElevesActifs] = useState<Eleve[]>([]);
  const [tempsMoyen, setTempsMoyen] = useState<number>(0);

  const token = localStorage.getItem("token"); // JWT
  const headers = { Authorization: `Bearer ${token}` };

  // 🔹 Charger les graphiques et stats au montage
  useEffect(() => {
    // Connexions par jour
    axios.get<Record<string, number>>("/api/admin_dashboard/connexions-par-jour?days=7", { headers })
      .then(res => {
        const data: ConnexionJour[] = Object.entries(res.data).map(
          ([date, count]) => ({ date, count })
        );
        setConnexionsJour(data);
      });

    // Connexions par heure
    axios.get<Record<string, number>>("/api/admin_dashboard/connexions-par-heure", { headers })
      .then(res => {
        const data: ConnexionHeure[] = Object.entries(res.data).map(
          ([hour, count]) => ({ hour, count })
        );
        setConnexionsHeure(data);
      });

    // Temps moyen par élève
    axios.get<{ avg_minutes: number }>("/api/admin_dashboard/temps-moyen-eleve", { headers })
      .then(res => setTempsMoyen(res.data.avg_minutes));

    // Élèves les plus actifs
    axios.get<Eleve[]>("/api/admin_dashboard/eleves-plus-actifs", { headers })
      .then(res => setElevesActifs(res.data));

  }, [token]);

  // 🔹 Rafraîchir la liste des élèves connectés toutes les 30s
  useEffect(() => {
    const fetchEleves = () => {
      axios.get<Eleve[]>("/api/admin_dashboard/eleves-en-ligne", { headers })
        .then(res => setElevesEnLigne(res.data))
        .catch(err => console.error("Erreur récupération élèves en ligne:", err));
    };

    fetchEleves(); // appel initial
    const interval = setInterval(fetchEleves, 30000); // toutes les 30s
    return () => clearInterval(interval); // nettoyage
  }, [token]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Admin CODE</h1>

      {/* Connexions par jour et par heure */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold mb-2">Connexions par jour (7 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={connexionsJour}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
              <XAxis dataKey="date"/>
              <YAxis/>
              <Tooltip/>
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold mb-2">Connexions par heure (aujourd'hui)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={connexionsHeure}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
              <XAxis dataKey="hour"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Élèves connectés et temps moyen */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold mb-2">Élèves connectés maintenant</h2>
          <ul className="list-disc pl-6 max-h-60 overflow-auto">
            {elevesEnLigne.length === 0 ? (
              <li>Aucun élève en ligne pour le moment</li>
            ) : (
              elevesEnLigne.map(e => (
                <li key={e.id}>{e.nom} {e.prenom} ({e.email})</li>
              ))
            )}
          </ul>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold mb-2">Temps moyen par élève (minutes)</h2>
          <p className="text-2xl">{tempsMoyen} min</p>
        </div>
      </div>

      {/* Élèves les plus actifs */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="font-bold mb-2">Élèves les plus actifs</h2>
        <ul className="list-disc pl-6 max-h-60 overflow-auto">
          {elevesActifs.length === 0 ? (
            <li>Aucun élève actif pour le moment</li>
          ) : (
            elevesActifs.map(e => (
              <li key={e.id}>{e.nom} {e.prenom} ({e.email}) - {e.total_minutes ?? 0} min</li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}