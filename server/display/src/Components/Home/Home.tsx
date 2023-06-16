import { useState, useEffect } from 'react';
import HttpService from '../../Services/HttpService';
import moonImage from './moon.png';
import './Home.css';

export default function Home() {
    const [serverConfig, setServerConfig] = useState<any>();

    useEffect(() => {
        HttpService.fetchConfig()
            .then((res) => res.json())
            .then((serverConfig) => {
                setServerConfig(serverConfig);
            });
    }, []);

    return (
        <main className="home-main-container">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <div className="clouds"></div>

            <div className="home-titles-container">
                <div className="home-title home-title-top">
                    <span className="home-title-hide">.</span>SUPER<span className="home-title-hide">.</span>
                </div>
                <div className="home-title home-title-bottom">
                    <span className="home-title-hide">.</span>LUNAR LANDER<span className="home-title-hide">.</span>
                </div>

                <div className="home-buttons-container">
                    <a href="/how-to-play" target="_blank" className="btn btn-hover btn-anim btn-howtoplay">
                        <div className="btn-label">Guide</div>
                        <span className="btn-text">How to Play</span>
                    </a>
                    <a href="/training" target="_blank" className="btn btn-hover btn-anim btn-training">
                        <span className="btn-label">Training</span>
                        <span className="btn-text">With your keyboard</span>
                    </a>
                    <a href="/monitoring" target="_blank" className="btn btn-hover btn-anim btn-monitoring">
                        <span className="btn-label">Monitoring</span>
                        <span className="btn-text">Back to the 70's</span>
                    </a>
                </div>

                <img src={moonImage} className="moon-image" />
            </div>
            
        </main>
    );
}
