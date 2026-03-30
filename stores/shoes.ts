import { defineStore } from 'pinia'
import { products } from '~/data/products'
import type { Product } from '~/data/products'

interface ShoeRow {
  id: string
  brand: string
  model: string
  description: string
  prix: number
  foulee: string[]
  terrain: string[]
  amorti: string
  drop_mm: number
  poids_g: number
  stabilite: string
  dynamisme: string
  largeur_disponible: string[]
  niveau: string[]
  objectif: string[]
  benefits: string[]
  image_url: string | null
}

function mapRowToProduct(row: ShoeRow): Product {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    description: row.description,
    prix: row.prix,
    foulee: row.foulee as Product['foulee'],
    terrain: row.terrain as Product['terrain'],
    amorti: row.amorti as Product['amorti'],
    drop: row.drop_mm,
    poids: row.poids_g,
    stabilite: row.stabilite as Product['stabilite'],
    dynamisme: row.dynamisme as Product['dynamisme'],
    largeurDisponible: row.largeur_disponible as Product['largeurDisponible'],
    niveau: row.niveau as Product['niveau'],
    objectif: row.objectif as Product['objectif'],
    benefits: row.benefits,
    image: row.image_url ?? '',
  }
}

export const useShoesStore = defineStore('shoes', () => {
  const supabase = useSupabaseClient()

  // Démarre avec les données statiques comme fallback
  const dbProducts = ref<Product[]>(products)
  const loading = ref(false)
  const fetched = ref(false)

  const fetchShoes = async () => {
    if (fetched.value) return
    loading.value = true

    const { data, error } = await supabase
      .from('shoes')
      .select(
        'id, brand, model, description, prix, foulee, terrain, amorti, drop_mm, poids_g, stabilite, dynamisme, largeur_disponible, niveau, objectif, benefits, image_url',
      )
      .eq('is_active', true)
      .order('brand')

    if (error) {
      console.warn('[useShoesStore] Supabase error, using static fallback:', error.message)
    } else if (!data || data.length === 0) {
      console.warn('[useShoesStore] Empty DB, using static fallback')
    } else {
      dbProducts.value = (data as ShoeRow[]).map(mapRowToProduct)
    }

    loading.value = false
    fetched.value = true
  }

  const getShoeById = (id: string) => dbProducts.value.find((p) => p.id === id) ?? null

  return { dbProducts, loading, fetchShoes, getShoeById }
})
