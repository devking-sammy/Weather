import { useState } from 'react'
import WeatherApp from './weatherApp'



function App() {
  const [count, setCount] = useState(0)

  return (
      <div>
      <WeatherApp />
      </div>
  )
}

export default App
