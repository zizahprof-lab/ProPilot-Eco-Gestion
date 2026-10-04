import { createClient } from '@supabase/supabase-js'

async function resolveConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  if (envUrl && envKey) {
    return { url: envUrl, publishableKey: envKey }
  }

  const configUrl = 'https://amgqazotopxgfxgxtweo.supabase.co/functions/v1/public-config'
  const response = await fetch(configUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Configuration ProPilot indisponible.')
  }

  const source = await response.text()
  const match = source.match(/window\.__PROPILOT_CONFIG__=(\{.*\});?/)
  if (!match) {
    throw new Error('Configuration ProPilot invalide.')
  }

  const config = JSON.parse(match[1])
  if (!config?.url || !config?.publishableKey) {
    throw new Error('Configuration Supabase manquante.')
  }
  return config
}

const { url, publishableKey } = await resolveConfig()

export const supabase = createClient(url, publishableKey)
