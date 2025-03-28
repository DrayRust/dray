import { useEffect } from 'react'

const Server: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => setNavState(1), [setNavState])

    return <div>Server Page</div>
}

export default Server
