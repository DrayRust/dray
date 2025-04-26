import { useState, useEffect } from 'react'

export const useWindowFocused = () => {
    const [isWindowFocused, setIsWindowFocused] = useState(true)

    useEffect(() => {
        const handleFocus = () => setIsWindowFocused(true)
        const handleBlur = () => setIsWindowFocused(false)
        const handleVisibilityChange = () => {
            setIsWindowFocused(document.visibilityState === 'visible')
        }

        window.addEventListener('focus', handleFocus)
        window.addEventListener('blur', handleBlur)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            window.removeEventListener('focus', handleFocus)
            window.removeEventListener('blur', handleBlur)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return isWindowFocused
}
