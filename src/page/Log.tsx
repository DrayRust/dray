import { useEffect } from 'react'

const Log: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(4)
    }, [setNavState])
    return <div>Log Page</div>
}

export default Log
