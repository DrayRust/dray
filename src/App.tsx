import { useState } from 'react'
import { invoke } from "@tauri-apps/api/core"
import './App.css'

/*function isWindows() {
	return /Win/i.test(navigator.userAgent)
}

function isLinux() {
	return /Linux/i.test(navigator.userAgent)
}

function isIOS() {
	return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isAndroid() {
	return /Android/i.test(navigator.userAgent)
}*/

function isMacOS() {
	return /Mac/i.test(navigator.userAgent)
}

if (isMacOS()) {
	isMacOSByKeydown()
}

function isMacOSByKeydown() {
	document.addEventListener('keydown', (event) => {
		if (event.metaKey && event.key === 'z') {
			document.execCommand('undo')
		} else if (event.metaKey && event.shiftKey && event.key === 'z') {
			document.execCommand('redo')
		} else if (event.metaKey && event.key === 'x') {
			document.execCommand('cut')
		} else if (event.metaKey && event.key === 'c') {
			document.execCommand('copy')
		} else if (event.metaKey && event.key === 'v') {
			document.execCommand('paste')
		} else if (event.metaKey && event.key === 'a') {
			document.execCommand('selectAll')
		}
	})
}

function App() {
	const [drayMsg, setDrayMsg] = useState("")
	const [name, setName] = useState("")

	async function dray() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setName("Hello World!")
		setDrayMsg(await invoke("dray", {name}))
	}

	return (
		<>
			<div className="card">
				<button onClick={() => dray()}>{drayMsg}</button>
			</div>
		</>
	)
}

export default App
