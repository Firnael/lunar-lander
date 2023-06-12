import { useEffect, useContext } from 'react';
import { ConfigContext } from '../../Contexts/ConfigContext';
import './HowToPlay.css';

export default function HowToPlay() {
    const serverConfig = useContext(ConfigContext);

    useEffect(() => {
        if (Object.keys(serverConfig).length) {
            console.log(serverConfig);
        }
    }, [serverConfig]);

    return (
        <main className="howtoplay-main-container">
            How To play !
        </main>
    );
}
