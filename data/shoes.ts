/**
 * shoes.ts — catalogue normalisé pour le mode Swipe
 * Wrapper léger sur products.ts qui ajoute slug + tags calculés.
 */
import { products, getRecommendations } from "./products";
import type { Product, UserProfile } from "./products";

export type { UserProfile };

export interface Shoe extends Product {
  slug: string;
  tags: string[];
}

export function buildTags(p: Product): string[] {
  const tags: string[] = [...p.foulee, ...p.terrain];
  if (p.amorti === "élevé") tags.push("max cushion");
  if (p.amorti === "faible") tags.push("minimaliste");
  if (p.dynamisme === "élevé") tags.push("dynamique");
  if (p.stabilite === "élevée") tags.push("stabilité");
  if (p.drop <= 4) tags.push("drop zéro");
  if (p.poids < 230) tags.push("ultra-léger");
  if (p.prix >= 200) tags.push("premium");
  if (p.prix < 130) tags.push("bon rapport qualité/prix");
  return [...new Set(tags)];
}

export const shoes: Shoe[] = products.map((p) => ({
  ...p,
  slug: p.id,
  tags: buildTags(p),
}));

export function getShoeBySlug(slug: string): Shoe | undefined {
  return shoes.find((s) => s.slug === slug);
}

export interface SwipeDeckItem {
  shoe: Shoe;
  score: number;
  reasons: string[];
}

/**
 * Retourne jusqu'à `limit` chaussures triées par score de correspondance
 * pour alimenter le SwipeDeck.
 */
export function getSwipeDeck(
  profile: UserProfile,
  limit = 15,
  excludeIds: string[] = []
): SwipeDeckItem[] {
  const recs = getRecommendations(profile, limit + excludeIds.length);
  return recs
    .filter((r) => !excludeIds.includes(r.product.id))
    .slice(0, limit)
    .map((r) => ({
      shoe: shoes.find((s) => s.id === r.product.id)!,
      score: r.score,
      reasons: r.reasons,
    }))
    .filter((r) => !!r.shoe);
}

/**
 * Variante de getSwipeDeck qui accepte un catalogue dynamique (depuis la DB).
 * Utilisé par Swipe.tsx quand useShoes() retourne les données Supabase.
 */
export function buildSwipeDeck(
  profile: UserProfile,
  dynamicProducts: Product[],
  limit = 15,
  excludeIds: string[] = []
): SwipeDeckItem[] {
  const dynamicShoes: Shoe[] = dynamicProducts.map((p) => ({
    ...p,
    slug: p.id,
    tags: buildTags(p),
  }));

  const recs = getRecommendations(profile, limit + excludeIds.length, dynamicProducts);
  return recs
    .filter((r) => !excludeIds.includes(r.product.id))
    .slice(0, limit)
    .map((r) => ({
      shoe: dynamicShoes.find((s) => s.id === r.product.id)!,
      score: r.score,
      reasons: r.reasons,
    }))
    .filter((r) => !!r.shoe);
}
