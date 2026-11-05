# Brancher un marchand Awin (exemple : Deporvillage FR)

Compte éditeur Awin : **2835928** (`AWIN_PUBLISHER_ID`). Deporvillage FR : programme déjà rejoint.
Les autres marchands (i-Run, Courir, Intersport, The Running Collective…) suivent la même procédure
une fois ta candidature acceptée.

## 1. Dans Awin : retrouver le flux

Ouvre ta liste de flux (Awin → Boîte à outils → Create-a-Feed → lien « Product Feed List », ou l'adresse
`https://ui.awin.com/productdata-darwin-download/publisher/<ID_EDITEUR>/<CLE_FLUX>/1/feedList`) :
c'est un CSV de tous les flux auxquels ton compte a accès.

Pour **Deporvillage FR** (annonceur **76934** = ton `awinmid`), il y a deux flux français :
- **97251** `FR_generic-feed` (~237 000 produits, mode, toutes catégories) → **celui à utiliser**
- 118529 `Idealo FR` (~234 000 produits) → flux prévu pour les comparateurs de prix, plan B

La dernière colonne de chaque ligne contient l'URL de téléchargement. Pars de celle de la ligne 97251 et
**ajoute `/columns/…`** pour demander les colonnes nécessaires (par défaut, Awin n'envoie pas `brand_name`
ni `in_stock`) :

```
<URL_DE_LA_LIGNE_97251>/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_deep_link,aw_image_url,search_price,currency,brand_name,in_stock,merchant_category,ean/
```

- `compression/gzip` est accepté (recommandé : le fichier est ~10 fois plus petit) ; l'import lit le flux
  ligne par ligne, sans le charger en mémoire.
- `adultcontent/1` n'est pas nécessaire.
- Ne mets **jamais** cette URL dans le code, un commit ou une conversation : elle contient la clé du flux.

## 2. Dans ton projet

`.env` (et variables d'environnement Vercel) :

```
AWIN_PUBLISHER_ID=2835928
AWIN_API_TOKEN=...            # token API publisher (ventes), différent de la clé de flux
AWIN_FEED_DEPORVILLAGE=...    # l'URL complète du point 1
```

> L'URL du flux ne va **jamais** dans la table `merchants` : cette table est lisible par tous les visiteurs.
> On y met seulement `env:AWIN_FEED_DEPORVILLAGE`.

SQL Editor Supabase :

```sql
insert into merchants (name, slug, feed_url, feed_format, affiliate_network, affiliate_tag, country, is_active)
values ('Deporvillage', 'deporvillage', 'env:AWIN_FEED_DEPORVILLAGE', 'csv', 'awin', '76934', 'FR', true)
on conflict (slug) do update set
  feed_url = excluded.feed_url, feed_format = excluded.feed_format,
  affiliate_network = excluded.affiliate_network, affiliate_tag = excluded.affiliate_tag,
  is_active = true;
```

## 3. Simulation puis import

Connecté comme admin sur le site, console du navigateur :

```js
// 1. SIMULATION : rien n'est écrit, on voit les correspondances proposées
fetch('/api/admin/sync-feeds', { method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ merchantSlug: 'deporvillage', dryRun: true }) })
  .then(r => r.json()).then(r => { const x = r.results[0]; console.log(x.itemsFetched, 'produits dans le flux');
    console.table(x.preview); console.log('Non rapprochés (marques du catalogue) :', x.unmatchedSample) })
```

Relis le tableau : chaque ligne doit être la **bonne chaussure, bonne version**. Le rapprochement est strict
(marque + tous les mots du modèle + même numéro de version, variantes enfant / GTX écartées), donc il rate
des produits plutôt que de se tromper. Les chaussures du catalogue absentes du flux resteront sans offre Deporvillage.

Si c'est bon, import réel (même appel avec `dryRun: false`). La tâche planifiée `syncFeeds` (03:00) le refait chaque nuit.

## 4. Vérification

- La vue `v_shoe_offers` (migration `20261028000002`) doit lister des lignes `deporvillage`, avec un **prix récent**.
- Clique sur une offre depuis la fiche chaussure : tu dois être redirigé (302) vers
  `https://www.awin1.com/cread.php?awinmid=…&awinaffid=2835928&clickref=…&ued=…`, puis sur la page produit Deporvillage.
- Une ligne apparaît dans `affiliate_clicks` (`network = awin`). Dans Awin, le clic est visible dans les rapports
  (parfois avec quelques heures de retard).
- Les ventes (`pending` puis `approved`) arrivent via `/admin/revenus` (token API requis).

## Limites connues

- Un seul marchand Awin éligible tant que les autres programmes n'ont pas accepté ta candidature.
- Le flux fait ~237 000 lignes : la lecture prend de quelques dizaines de secondes à quelques minutes. Sur Vercel,
  la tâche planifiée peut dépasser la durée maximale d'une fonction selon ton offre ; dans ce cas, lance la
  synchronisation depuis ta machine (`dryRun: false`) ou réduis le flux avec des catégories Awin (`/cid/…`).
- Les prix Amazon en base sont périmés (masqués) : un comparatif de prix honnête n'apparaîtra que quand
  au moins deux marchands auront un prix de moins de 7 jours.
- Le flux peut contenir des tailles / coloris : on garde une ligne par chaussure (en stock, titre le plus proche, la moins chère).
