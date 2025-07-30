export interface UserProfile {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  telephonePersoNum?: string;
  adresse?: string;
}

export type UserProfiles = UserProfile[];
