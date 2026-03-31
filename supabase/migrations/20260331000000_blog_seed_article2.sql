-- Seed : deuxième article de blog
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
  'Faut-il vraiment choisir sa pointure de running une taille au-dessus ? Mythe ou réalité',
  'pointure-running-taille-au-dessus-mythe-realite',
  'La règle "prenez une taille au-dessus" est partout. Mais est-elle valable pour tous les coureurs ? Ce que disent vraiment les podologues et la biomécanique.',
  $CONTENT$C'est probablement le conseil le plus répété dans les magasins de sport :
**"En running, prenez une taille au-dessus."**

On le retrouve chez les grandes marques comme Nike, Adidas ou ASICS, et même dans les recommandations de la *American Academy of Podiatric Sports Medicine*.

Mais cette règle est-elle vraiment valable pour tout le monde ?
La réponse courte : **non**.
La réponse complète mérite quelques explications.

---

## Pourquoi on recommande souvent une taille au-dessus

Cette règle ne sort pas de nulle part. Elle vient de phénomènes physiologiques bien documentés.

### 1. Le pied gonfle pendant l'effort

Lors d'une course :

- la circulation sanguine augmente
- la température du corps monte
- les tissus se dilatent

Résultat : le pied gagne du volume au fil des kilomètres.

Ce phénomène est encore plus marqué :

- en été
- sur longues distances
- chez les coureurs débutants

### 2. Le pied s'allonge à chaque impact

À chaque foulée, ton pied subit une force équivalente à 2 à 3 fois ton poids.

Lors de l'impact :

- la voûte plantaire s'écrase légèrement
- le pied s'allonge de quelques millimètres
- les orteils avancent dans la chaussure

Sur marathon ou trail long, cet effet se répète des dizaines de milliers de fois.

C'est la principale raison des fameux **ongles noirs**.

### 3. Les études podologiques confirment ce phénomène

Les podologues du sport observent régulièrement :

- un allongement du pied de 5 à 10 mm
- une augmentation du volume du pied de 3 à 5 %

D'où la règle simplifiée :
👉 prendre une taille au-dessus.

Mais cette règle est une **moyenne statistique**, pas une vérité universelle.

---

## Pourquoi cette règle est fausse pour beaucoup de coureurs

Le problème : elle ignore l'élément le plus important en running.
**La variabilité individuelle.**

Deux coureurs de même taille peuvent avoir :

- des pieds très différents
- une technique de course opposée
- des besoins totalement distincts

### 1. La morphologie du pied change tout

La taille n'est qu'un paramètre parmi d'autres. Variables clés :

- largeur du pied
- volume du cou-de-pied
- forme des orteils
- rigidité de la voûte plantaire

Exemple classique : un coureur au pied large qui prend une taille au-dessus se retrouve souvent avec une chaussure trop longue **et** trop large, donc instable.

### 2. Toutes les marques ne taillent pas pareil

C'est l'un des plus gros pièges. De manière générale :

- **Nike** → chaussant plutôt étroit et court
- **Adidas** → chaussant plus standard
- **ASICS** → souvent plus large à l'avant-pied

La "taille au-dessus" peut être pertinente chez une marque… et catastrophique chez une autre.

### 3. La distance de course change la taille idéale

| Type de sortie | Ajustement conseillé |
|---|---|
| Footing court (5–10 km) | Très proche du pied |
| Semi-marathon | Léger espace avant |
| Marathon | Plus de marge |
| Trail long | Encore plus de volume |

La règle universelle n'existe donc pas.

---

## Les risques d'une mauvaise pointure

Choisir la mauvaise taille n'est pas seulement inconfortable. C'est une cause fréquente de blessures.

### Pointure trop petite

Conséquences fréquentes :

- ongles noirs
- ampoules
- échauffements
- névrome de Morton
- perte de confort dès 30 min de course

### Pointure trop grande

On en parle beaucoup moins, mais c'est tout aussi problématique. Risques :

- pied qui bouge dans la chaussure
- frottements répétés
- perte de stabilité
- perte d'efficacité biomécanique

Une chaussure trop grande peut réduire ton efficacité de course.

---

## La vraie méthode pour choisir sa pointure running

Au lieu d'une règle simpliste, voici la méthode utilisée par les spécialistes.

### 1. La marge idéale à l'avant

Espace recommandé : **5 à 10 mm** entre l'orteil le plus long et l'avant de la chaussure.

Test simple :

- debout, pied chargé
- passer le pouce devant les orteils

### 2. Essayer ses chaussures au bon moment

Toujours essayer :

- en fin de journée
- après avoir marché
- avec les chaussettes de running

C'est à ce moment que ton pied se rapproche de sa taille réelle en course.

### 3. Vérifier le maintien du médio-pied

Le pied doit être :

- maintenu au milieu
- libre à l'avant
- stable au talon

C'est l'équilibre clé d'une bonne pointure running.

---

## Conclusion : la taille au-dessus est un raccourci

La fameuse règle n'est pas fausse. Elle est simplement **trop simpliste**.

La bonne pointure dépend de :

- ton pied
- ta foulée
- ta distance
- la marque
- le modèle

Autrement dit : elle dépend de **ton profil de coureur**.

Et c'est précisément pour cela que choisir sa chaussure de running reste difficile sans accompagnement ou outil spécialisé.$CONTENT$,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1260&h=750&fit=crop&q=80',
  true,
  NOW(),
  'RunMatch',
  ARRAY['guide', 'pointure', 'running', 'chaussures', 'biomécanique']
)
ON CONFLICT (slug) DO NOTHING;
