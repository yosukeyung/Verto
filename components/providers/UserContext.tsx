'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface UserProfile {
  email: string
  full_name: string
  avatar_id: string
}

interface UserContextValue {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  setProfile: (profile: UserProfile) => void
}

const defaultUserProfile: UserProfile = {
  email: '',
  full_name: '',
  avatar_id: 'love',
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function UserProvider({
  children,
  initialProfile,
}: {
  children: React.ReactNode
  initialProfile: UserProfile
}) {
  const [profile, setProfileState] = useState<UserProfile>(initialProfile || defaultUserProfile)

  // Keep state synchronized when SSR props change (e.g., after router.refresh())
  useEffect(() => {
    if (initialProfile) {
      setProfileState(initialProfile)
    }
  }, [initialProfile?.full_name, initialProfile?.avatar_id, initialProfile?.email])

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState((prev) => ({ ...prev, ...updates }))
  }, [])

  const setProfile = useCallback((newProfile: UserProfile) => {
    setProfileState(newProfile)
  }, [])

  return (
    <UserContext.Provider value={{ profile, updateProfile, setProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    return {
      profile: defaultUserProfile,
      updateProfile: () => {},
      setProfile: () => {},
    }
  }
  return context
}
