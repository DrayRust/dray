import { useEffect } from 'react'

const ServerImport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    return <></>
}

export default ServerImport
