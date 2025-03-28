import { useState, useEffect } from 'react'

export const useWindowFocus = () => {
    const [isWindowFocused, setIsWindowFocused] = useState(true)

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsWindowFocused(document.visibilityState === 'visible')
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return isWindowFocused
}
