// context/UserContext.tsx
"use client"

import { UserData } from "@/hooks/useFetchUserDetails"
import React, { createContext, useContext, useState, ReactNode } from "react"


interface UserContextType {
  user: UserData | null
  setUser: (user: UserData | null) => void
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
