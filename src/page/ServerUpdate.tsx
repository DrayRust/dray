import { useEffect } from 'react'

const ServerUpdate: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    return <></>
}

export default ServerUpdate
