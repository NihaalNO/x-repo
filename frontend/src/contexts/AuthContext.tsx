import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import api from '../services/api'
import type { User } from '../types'

interface AuthContextType {
  currentUser: FirebaseUser | null
  userProfile: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // @ts-ignore
  const fetchUserProfile = async (uid: string) => {
    try {
      const response = await api.get('/auth/me')
      setUserProfile(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setUserProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser.uid)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUserProfile(null)
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

