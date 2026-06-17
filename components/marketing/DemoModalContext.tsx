'use client'

import { createContext, useContext } from 'react'

/** Opens the shared "Book a Demo" modal that lives in the marketing shell. */
export const DemoModalContext = createContext<() => void>(() => {})

export const useDemoModal = () => useContext(DemoModalContext)
