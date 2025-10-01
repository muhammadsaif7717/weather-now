import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

export default function NextThemeProvider({children}:{
  children: ReactNode;
}) {
  return (
     <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
  )
}
