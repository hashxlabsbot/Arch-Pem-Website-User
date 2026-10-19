import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role?:         string
    planName?:     string | null
    hasDesktop?:   boolean
    tokenVersion?: number
  }
  interface Session {
    user: {
      id:       string
      name?:    string | null
      email?:   string | null
      image?:   string | null
      role:     string
      planName: string | null
      hasDesktop: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:           string
    role:         string
    planName:     string | null
    hasDesktop?:   boolean
    tokenVersion: number
    checkedAt:    number
  }
}
