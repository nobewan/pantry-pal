import Dashboard from './components/Dashboard.jsx'
import Cards from './components/Cards.jsx'
import Camera from './components/Camera.jsx'
import Result from './components/Result.jsx'
import WebcamCapture from './components/WebcamCapture.jsx'
import Notifications from './components/Notifications.jsx'
import FoodMonitor from './components/FoodMonitor.jsx'

function App() {
    return(
        <>
        <body className = "bg-slate-300"></body>
        <Dashboard></Dashboard>
        <Cards></Cards>
        <Camera></Camera> {/* Placeholder for Cam */}
        {/*<WebcamCapture></WebcamCapture>*/}
        <Result></Result>
        {/*<Notifications></Notifications>*/}
        <FoodMonitor></FoodMonitor>

        </>
    )
  }
  
  export default App