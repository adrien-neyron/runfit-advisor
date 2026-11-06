import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
  features: { tooling: false, stylistic: false },
})
  .prepend({
    // src/ : ancien code React, non utilisé par Nuxt
    ignores: ['src/**', '.output/**', '.nuxt/**', 'dist/**', 'supabase/functions/**'],
  })
  .append(
    {
      rules: {
        // Pas de types Supabase générés : `as any` est la convention actuelle du projet
        '@typescript-eslint/no-explicit-any': 'off',
        // Suppression dynamique utilisée pour réinitialiser les erreurs de formulaire
        '@typescript-eslint/no-dynamic-delete': 'off',
        // Règles de présentation : la CI ne doit bloquer que sur la correction du code
        'vue/html-self-closing': 'off',
        'vue/attributes-order': 'off',
        'vue/require-default-prop': 'off',
        'vue/one-component-per-file': 'off',
        'vue/first-attribute-linebreak': 'off',
      },
    },
    {
      // Scripts ponctuels : les catch vides sont volontaires (nettoyage, tentatives)
      files: ['scripts/**'],
      rules: {
        'no-empty': 'off',
        'no-unused-vars': 'off',
      },
    },
    {
      files: ['tailwind.config.ts'],
      rules: { '@typescript-eslint/no-require-imports': 'off' },
    },
  )
