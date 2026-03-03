import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {AuthProvider} from "./context/AuthContext.jsx";
import {LanguageProvider} from "./context/LanguageContext";
import {ThemeProvider} from "./context/ThemeContext";

createRoot(document.getElementById('root')).render(
    <LanguageProvider>
        <ThemeProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
    </LanguageProvider>
)
