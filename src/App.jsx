import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PlotsPage from './pages/plots/PlotsPage'
import PlotDetailPage from './pages/plots/PlotDetailPage'
import TasksPage from './pages/tasks/TasksPage'
import CircularPage from './pages/circular/CircularPage'
import PestPage from './pages/pest/PestPage'
import InventoryPage from './pages/inventory/InventoryPage'
import SalesPage from './pages/sales/SalesPage'

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plots" element={<PlotsPage />} />
          <Route path="/plots/:plotId" element={<PlotDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/circular" element={<CircularPage />} />
          <Route path="/pest" element={<PestPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/sales" element={<SalesPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  )
}

export default App

