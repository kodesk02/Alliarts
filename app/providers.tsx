'use client'

import AlliLoader from '@/components/loader/alliLoader'
import React from 'react'

export default function Providers({children}: {children : React.ReactNode}) {
    const [isLoading, setIsLoading] = React.useState(true)

  return (
    <>
      {isLoading && (
        <AlliLoader onLoadingComplete={() => setIsLoading(false)} />
      )}
      {children}
    </>
  )
}
