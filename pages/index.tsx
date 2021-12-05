import type { NextPage } from 'next'
import AppProvider from '../components/App/AppProvider'
import App from '../components/App/App'
import 'antd/dist/antd.css'
import { useEffect } from 'react'
import { initializeCron } from '../controllers'

const Home: NextPage = () => {
  useEffect(() => {
    ;(async () => {
      await initializeCron()
    })()
  }, [])

  return (
    <AppProvider>
      <App />
    </AppProvider>
  )
}

export default Home
