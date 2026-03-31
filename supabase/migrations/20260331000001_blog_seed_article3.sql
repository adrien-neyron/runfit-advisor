-- Seed : troisième article de blog
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  cover_url,
  published,
  published_at,
  author_name,
  tags
) VALUES (
  'Faut-il vraiment choisir ses chaussures selon sa foulée (pronation, supination, universelle) ?',
  'chaussures-foulee-pronation-supination-guide',
  'Analyser sa foulée avant d''acheter ses chaussures de running : bonne idée ou mythe marketing ? Ce que dit vraiment la science — et ce qui compte réellement.',
  $CONTENT$Pendant des années, le discours des marques et des magasins spécialisés a été clair :
**"Analyse ta foulée avant d'acheter tes chaussures."**

Mais aujourd'hui, la science nuance fortement ce message. Entre marketing, biomécanique et réalité terrain, il est temps de clarifier ce sujet pour les coureurs.

---

## Pourquoi on parle autant de pronation ?

Quand tu cours, ton pied effectue naturellement une rotation vers l'intérieur appelée **pronation**.
C'est un mécanisme normal qui sert à absorber les chocs.

On distingue généralement :

- **Foulée universelle (neutre)** → pronation normale
- **Sur-pronation** → rotation interne plus marquée
- **Supination** → rotation externe

Pendant longtemps, les marques comme ASICS, Brooks ou Saucony ont développé des chaussures "stabilité" pour corriger la pronation.

Mais voici la réalité.

---

## Ce que dit la science aujourd'hui

Des recherches soutenues par des organismes comme l'*American Academy of Orthopaedic Surgeons* montrent que :

> La corrélation entre pronation et blessures est faible.

Autrement dit :

- Beaucoup de coureurs pronateurs ne se blessent jamais
- Beaucoup de coureurs neutres se blessent régulièrement

Le facteur déterminant n'est pas la foulée seule, mais l'ensemble :

- volume d'entraînement
- historique de blessures
- morphologie
- fatigue musculaire

**Corriger la foulée n'est pas une solution miracle.**

---

## Ce qui compte vraiment pour éviter les blessures

Les grandes marques comme Nike, HOKA ou New Balance orientent désormais leurs gammes vers le **confort et la tolérance** plutôt que la correction agressive.

### 1. Le confort immédiat (le critère n°1)

C'est aujourd'hui le consensus scientifique :
**La chaussure la plus confortable est souvent la meilleure.**

Si une chaussure semble naturelle dès l'essayage :

- foulée fluide
- pas de point dur
- pas de tension

C'est déjà un excellent indicateur biomécanique.

### 2. La stabilité globale (pas la correction)

Attention — nuance importante :

> Une chaussure stable ≠ chaussure corrective.

Une chaussure stable offre :

- base large
- mousse peu instable
- bon maintien du talon

Idéal pour :

- débutants
- reprise après blessure
- coureurs de plus de 70 kg
- fatigue musculaire importante

### 3. Le niveau musculaire du coureur

Plus un coureur est débutant, plus ses muscles stabilisateurs sont faibles.

Résultat :

- il s'affaisse plus à l'impact
- il fatigue plus vite
- il compense davantage

C'est pour ça que les débutants préfèrent souvent des chaussures stables, tandis que les coureurs expérimentés tolèrent des modèles plus légers.

### 4. Le poids du coureur

Le poids influence énormément :

- l'écrasement de la mousse
- la stabilité en appui
- la fatigue musculaire

Un coureur de 90 kg n'utilise pas la chaussure comme un coureur de 60 kg. Plus le poids est élevé, plus la mousse doit être durable et la plateforme stable.

### 5. L'historique de blessures

C'est le facteur que la foulée seule ne remplace pas.

| Blessure | Orientation conseillée |
|---|---|
| Syndrome rotulien | Plus d'amorti, drop modéré |
| Tendinite d'Achille | Drop plus élevé |
| Fasciite plantaire | Plus de soutien voûte plantaire |
| Périostite | Amorti maximal, surface souple |

Chaque blessure oriente vers un profil de chaussure différent — bien plus que la foulée.

---

## Conclusion : faut-il encore analyser la foulée ?

Oui… mais ce n'est qu'un petit morceau du puzzle.

Aujourd'hui, choisir une chaussure de running repose surtout sur :

1. **Confort immédiat** — le vrai critère n°1
2. **Stabilité globale** — pas correction
3. **Expérience du coureur** — débutant ou confirmé
4. **Poids** — impact sur la mousse et la plateforme
5. **Blessures passées** — le signal le plus fiable

La foulée seule ne suffit plus à déterminer la bonne chaussure.

Et c'est exactement là que croiser toutes ces variables humaines — pas seulement la biomécanique — fait la différence.$CONTENT$,
  'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1260&h=750&fit=crop&q=80',
  true,
  NOW(),
  'RunMatch',
  ARRAY['guide', 'foulée', 'pronation', 'biomécanique', 'running']
)
ON CONFLICT (slug) DO NOTHING;
