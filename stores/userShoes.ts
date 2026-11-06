import { defineStore } from 'pinia'

export interface UserShoe {
  id: string
  shoeId: string | null
  customName: string | null
  terrain: 'route' | 'trail'
  km: number
  purchasedOn: string | null
  status: 'active' | 'retired'
}

function fromRow(r: Record<string, any>): UserShoe {
  return {
    id: r.id,
    shoeId: r.shoe_id ?? null,
    customName: r.custom_name ?? null,
    terrain: r.terrain === 'trail' ? 'trail' : 'route',
    km: Number(r.km_current ?? 0),
    purchasedOn: r.purchased_on ?? null,
    status: r.status === 'retired' ? 'retired' : 'active',
  }
}

export const useUserShoesStore = defineStore('userShoes', () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  const shoes = ref<UserShoe[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const active = computed(() => shoes.value.filter((s) => s.status === 'active'))

  const load = async () => {
    if (!user.value) { shoes.value = []; return }
    loading.value = true
    error.value = null
    const { data, error: err } = await supabase
      .from('user_shoes')
      .select('id, shoe_id, custom_name, terrain, km_current, purchased_on, status')
      .order('created_at', { ascending: false })
    if (err) error.value = "Impossible de charger ton équipement."
    else shoes.value = (data ?? []).map(fromRow)
    loading.value = false
  }

  const add = async (input: { shoeId?: string | null; customName?: string | null; terrain: 'route' | 'trail'; km: number; purchasedOn?: string | null }) => {
    error.value = null
    const { data, error: err } = await (supabase.from('user_shoes') as any)
      .insert({
        shoe_id: input.shoeId || null,
        custom_name: input.shoeId ? null : (input.customName ?? '').trim() || null,
        terrain: input.terrain,
        km_current: Math.max(0, Math.min(5000, input.km || 0)),
        purchased_on: input.purchasedOn || null,
      })
      .select('id, shoe_id, custom_name, terrain, km_current, purchased_on, status')
      .single()
    if (err || !data) { error.value = "Impossible d'ajouter cette chaussure."; return false }
    shoes.value = [fromRow(data), ...shoes.value]
    return true
  }

  const patch = async (id: string, values: Record<string, unknown>) => {
    error.value = null
    const { error: err } = await (supabase.from('user_shoes') as any)
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (err) { error.value = 'Modification impossible.'; return false }
    return true
  }

  const setKm = async (id: string, km: number) => {
    const value = Math.max(0, Math.min(5000, Math.round(km * 10) / 10))
    if (!(await patch(id, { km_current: value }))) return false
    shoes.value = shoes.value.map((s) => (s.id === id ? { ...s, km: value } : s))
    return true
  }

  const retire = async (id: string) => {
    if (!(await patch(id, { status: 'retired' }))) return false
    shoes.value = shoes.value.map((s) => (s.id === id ? { ...s, status: 'retired' } : s))
    return true
  }

  const remove = async (id: string) => {
    const { error: err } = await supabase.from('user_shoes').delete().eq('id', id)
    if (err) { error.value = 'Suppression impossible.'; return false }
    shoes.value = shoes.value.filter((s) => s.id !== id)
    return true
  }

  watch(user, () => load(), { immediate: true })

  return { shoes, active, loading, error, load, add, setKm, retire, remove }
})
