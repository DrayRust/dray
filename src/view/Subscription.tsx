import { useEffect } from 'react'

const Subscription: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(2)
    }, [setNavState])
    return <div>Subscription Page</div>
}

export default Subscription
