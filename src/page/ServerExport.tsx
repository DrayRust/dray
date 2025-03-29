import { useEffect } from 'react'

const ServerExport: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])
    return <></>
}

export default ServerExport
