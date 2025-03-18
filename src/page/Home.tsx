import { useState } from 'react'
import { invoke } from "@tauri-apps/api/core"

interface HomeProps {
    setNavState?: any
}

const Home: React.FC<HomeProps> = ({setNavState}) => {
    setNavState(0)
    const [drayMsg, setDrayMsg] = useState("")
    const [name, setName] = useState("")

    async function dray() {
        setName("Hello World!")
        setDrayMsg(await invoke("dray", {name}))
    }

    return <>
        <div className="card">
            <button onClick={() => dray()}>{drayMsg}</button>
        </div>
    </>
}

export default Home
