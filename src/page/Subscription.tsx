interface SubscriptionProps {
    setNavState?: any
}

const Subscription: React.FC = ({setNavState}: SubscriptionProps) => {
    setNavState(2)
    return <div>Subscription Page</div>
}

export default Subscription
