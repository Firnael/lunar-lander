import { createContext, useEffect, useState } from 'react';
import HttpService from '../Services/HttpService';

export const ConfigContext = createContext({});

export default function ConfigProvider({children}: any) {
    const [config, setConfig] = useState({});

    useEffect(() => {
        // retrieve config (cannot start game without this)
        HttpService.fetchConfig()
            .then((res) => res.json())
            .then((config) => {
                setConfig(config);
            });
    }, []);

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}
