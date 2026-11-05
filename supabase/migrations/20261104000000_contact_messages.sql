-- ============================================================
-- Messages du formulaire de contact (POST /api/contact)
-- ============================================================
-- Écrits uniquement par le serveur (service_role). RLS activée SANS politique :
-- ni anon ni authenticated ne peuvent lire ou écrire cette table depuis le navigateur.

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 100),
  email       text not null check (char_length(email) <= 254),
  subject     text not null default 'general',
  message     text not null check (char_length(message) between 10 and 5000),
  handled_at  timestamptz
);

alter table public.contact_messages enable row level security;

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

comment on table public.contact_messages is
  'Messages du formulaire /contact. Données personnelles : durée de conservation à fixer (ex. 12 mois) dans la politique de confidentialité.';
