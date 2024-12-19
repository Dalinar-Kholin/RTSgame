import './App.css'
import './index.css'
import MainSite, {gameSocket} from "./components/mainSite.tsx";
import {Route, Routes} from "react-router-dom";
import GameWaitingRoom from "./components/gameWaitingRoom/waitingRoom.tsx";
import {useEffect} from "react";



export default function App() {

    useEffect(() => {
        return ()=> {
            console.log("web socket closed")
            gameSocket.close()
        }
    }, []);

    return <>
        <Routes>
            <Route path={"/*"} element={<MainSite/>}/>
            <Route path={"/mainSite"} element={<MainSite/>}/>
            <Route path={"/gameWaitingRoom"} element={<GameWaitingRoom/>}/>
        </Routes>
    </>
}


