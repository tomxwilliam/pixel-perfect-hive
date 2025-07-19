
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/integrations/supabase/client'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const { user } = useAuth()
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    // Load user's theme preference from database
    if (user) {
      loadUserTheme()
    }
  }, [user])

  const loadUserTheme = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.theme) {
        setTheme(data.theme as Theme)
        localStorage.setItem(storageKey, data.theme)
      }
    } catch (error) {
      console.error('Error loading user theme:', error)
    }
  }

  const updateTheme = async (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem(storageKey, newTheme)

    // Save to database if user is logged in
    if (user) {
      try {
        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (existing) {
          await supabase
            .from('user_preferences')
            .update({ theme: newTheme })
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('user_preferences')
            .insert({ user_id: user.id, theme: newTheme })
        }
      } catch (error) {
        console.error('Error saving theme preference:', error)
      }
    }
  }

  const value = {
    theme,
    setTheme: updateTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
