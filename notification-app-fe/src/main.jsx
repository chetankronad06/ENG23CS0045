import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { configureLogger, Log } from "logging-middleware";

configureLogger({
  clientId: import.meta.env.VITE_LOG_CLIENT_ID,
  clientSecret: import.meta.env.VITE_LOG_CLIENT_SECRET,
  email: import.meta.env.VITE_LOG_EMAIL,
  name: import.meta.env.VITE_LOG_NAME,
  rollNo: import.meta.env.VITE_LOG_ROLL_NO,
  accessCode: import.meta.env.VITE_LOG_ACCESS_CODE
});

Log("frontend", "info", "config", "Frontend initialized").catch(err => {
  console.error(err);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
