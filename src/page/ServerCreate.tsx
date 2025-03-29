import { useEffect } from 'react'

const ServerCreate: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    return <></>
}

export default ServerCreate
