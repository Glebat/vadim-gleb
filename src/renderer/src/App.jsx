import { useEffect } from 'react'
import electronLogo from './assets/electron.svg'

function App() {
  useEffect(() => {
    (async (data="test") => await window.api.foo(data))()
  }, [])


  return (
    <div>
    </div>
  )
}

export default App

