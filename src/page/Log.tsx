import {useEffect} from 'react'
import {readAllLogsList} from "../util/invoke.ts";

const Log: React.FC<NavProps> = ({setNavState}) => {
    useEffect(() => {
        setNavState(4)
    }, [setNavState])

    useEffect(() => {
        readAllLogsList().then((c) => {
            console.log(c)
        }).catch(_ => 0)
    }, [])
    return <div>Log Page</div>
}

export default Log
