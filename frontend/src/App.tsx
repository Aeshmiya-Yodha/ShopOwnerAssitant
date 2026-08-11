import { useState } from 'react'

import ChatWidget from './ChatWidget'
import DashboardPage from './DashboardPage'
import RequestStockPage from './RequestStockPage'

type Tab = 'dashboard' | 'request'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">SA</span>
            <div>
              <h1>Shop Assistant</h1>
              <p>Sharma General Store</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <div className="tabs-inner">
          <button
            type="button"
            className={tab === 'dashboard' ? 'tab tab-active' : 'tab'}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={tab === 'request' ? 'tab tab-active' : 'tab'}
            onClick={() => setTab('request')}
          >
            Request Stock
          </button>
        </div>
      </nav>

      <main className="content">
        {tab === 'dashboard' ? <DashboardPage /> : <RequestStockPage />}
      </main>

      <ChatWidget />
    </div>
  )
}
