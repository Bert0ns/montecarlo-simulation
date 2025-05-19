"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { Theme, ThemeProviderState, ThemeProviderProps } from "./index.types"

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

const ThemeProvider: React.FC<ThemeProviderProps> = ({children, defaultTheme = "system"}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(defaultTheme)

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme)
            return;
        }

        root.classList.add(theme)
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            setTheme(theme)
            localStorage.setItem("theme", theme)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}
export default ThemeProvider;

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)
    if (context === undefined)
        throw new Error("useTheme deve essere usato all'interno di un ThemeProvider")
    return context
}