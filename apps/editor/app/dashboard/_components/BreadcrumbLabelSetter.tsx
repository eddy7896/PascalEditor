'use client'

import { useContext, useEffect } from 'react'
import { BreadcrumbContext } from './breadcrumb-context'

interface BreadcrumbLabelSetterProps {
  segment: string
  label: string
}

export function BreadcrumbLabelSetter({ segment, label }: BreadcrumbLabelSetterProps) {
  const ctx = useContext(BreadcrumbContext)

  useEffect(() => {
    if (ctx && label) {
      ctx.setLabel(segment, label)
    }
  }, [ctx, segment, label])

  return null
}
