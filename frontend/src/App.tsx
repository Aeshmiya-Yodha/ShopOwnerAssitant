import { useState } from 'react'

import ChatWidget from './ChatWidget'
import DashboardPage from './DashboardPage'
import { CartIcon, ClockIcon, GridIcon, StoreIcon } from './icons'
import RequestStockPage from './RequestStockPage'

type Tab = 'dashboard' | 'request'

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'short',
  day: '2-digit',
  month: 'short',
})

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">
              <StoreIcon />
            </span>
            <div>
              <h1>Shop Assistant</h1>
              <p>
                Sharma General Store <i /> Inventory &amp; sales
              </p>
            </div>
          </div>

          <div className="topbar-meta">
            <span className="hero-pill">
              <i className="live-dot" />
              Live data
            </span>
            <span className="hero-pill">
              <ClockIcon />
              {today}
            </span>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <div className="tabs-inner">
          <div className="tab-group" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'dashboard'}
              className={tab === 'dashboard' ? 'tab tab-active' : 'tab'}
              onClick={() => setTab('dashboard')}
            >
              <GridIcon />
              Dashboard
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'request'}
              className={tab === 'request' ? 'tab tab-active' : 'tab'}
              onClick={() => setTab('request')}
            >
              <CartIcon />
              Request Stock
            </button>
          </div>
        </div>
      </nav>

      <main className="content" key={tab}>
        {tab === 'dashboard' ? <DashboardPage /> : <RequestStockPage />}
      </main>

      <ChatWidget />
    </div>
  )
}
