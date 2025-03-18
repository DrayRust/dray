interface LogProps {
    setNavState?: any;
}

const Log: React.FC = ({setNavState}: LogProps) => {
    setNavState(4)
    return <div>Log Page</div>
}

export default Log
