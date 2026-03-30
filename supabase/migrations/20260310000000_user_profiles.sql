-- Table : profil questionnaire utilisateur
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sexe            text,
  foulee          text,
  niveau          text,
  distance        text,
  terrain         text,
  objectif        text,
  largeur_pied    text,
  blessures       text,
  drop_preference text,
  amort_preference text,
  taille          integer     DEFAULT 175,
  poids           integer     DEFAULT 70,
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS : chaque utilisateur ne voit et ne modifie que son propre profil
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_self"
  ON public.user_profiles
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
