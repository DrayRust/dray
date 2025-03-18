interface ServerProps {
    setNavState?: any
}

const Server: React.FC = ({setNavState}: ServerProps) => {
    setNavState(1)
    return <div>Server Page</div>
}

export default Server
