-- Ajout des champs d'enrichissement progressif au profil utilisateur
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS budget          TEXT,
  ADD COLUMN IF NOT EXISTS voute_plantaire TEXT,
  ADD COLUMN IF NOT EXISTS volume          TEXT;
