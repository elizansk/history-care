import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import 'bootstrap/dist/css/bootstrap.min.css';
import './resources/css/style.css'
import './api/http'
import App from './App.tsx'

if (import.meta.env.MODE === 'tauri' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    })
    .catch((error) => {
      console.warn('Failed to unregister service workers in Tauri mode', error);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
