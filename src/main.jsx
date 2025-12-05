import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ClerkProviderWithRoutes from './context/ClerkProviderWithRoutes.jsx'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <ClerkProviderWithRoutes>
                <App />
            </ClerkProviderWithRoutes>
        </BrowserRouter>
    </React.StrictMode>,
)
