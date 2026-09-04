export type User = {
  id: string;
  email: string;
  nom: string;
  prenom: string;

  is_admin?: boolean;
  is_active?: boolean;
  is_blocked?: boolean;
  is_verified?: boolean;

  enseignant?: boolean;
  enseignant_actif?: boolean;
};