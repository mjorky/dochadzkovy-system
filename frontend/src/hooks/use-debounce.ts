"use client"

import { useState, useEffect } from "react"

/**
 * Custom hook that debounces a value.
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State na uloženie oneskorenej hodnoty
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Nastaví časovač, ktorý aktualizuje stav po uplynutí `delay`
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Toto je kľúčová časť: zruší predchádzajúci časovač pri každej zmene hodnoty.
    // Tým sa zabezpečí, že stav sa aktualizuje až vtedy, keď používateľ prestane písať.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay]) // Efekt sa spustí znova iba vtedy, ak sa zmení `value` alebo `delay`

  return debouncedValue
}