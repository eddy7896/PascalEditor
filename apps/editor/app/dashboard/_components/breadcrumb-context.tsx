'use client'

import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface BreadcrumbContextValue {
  labels: Record<string, string>
  setLabel: (key: string, label: string) => void
}

export const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({})

  const setLabel = useCallback((key: string, label: string) => {
    setLabels((prev) => {
      if (prev[key] === label) return prev
      return { ...prev, [key]: label }
    })
  }, [])

  const value = useMemo(() => ({ labels, setLabel }), [labels, setLabel])

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  )
}
