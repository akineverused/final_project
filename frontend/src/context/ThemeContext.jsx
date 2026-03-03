import { createContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(
        localStorage.getItem("theme") === "dark"
    );

    useEffect(() => {
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, setIsDark }}>
            <ConfigProvider
                theme={{
                    algorithm: isDark
                        ? theme.darkAlgorithm
                        : theme.defaultAlgorithm
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};