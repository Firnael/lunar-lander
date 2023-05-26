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

            <div className="titles-container">
                <div className="title title-top">
                    <span className="hide">.</span>SUPER<span className="hide">.</span>
                </div>
                <div className="title title-bottom">
                    <span className="hide">.</span>LUNAR LANDER<span className="hide">.</span>
                </div>

                <div className="buttons-container">
                    <a href="/monitoring" target="_blank" className="btn btn-hover btn-anim btn-monitoring">
                        <br/>
                        <br/>
                        Monitoring
                    </a>
                    <a href="/training" target="_blank" className="btn btn-hover btn-anim btn-training">
                        Training
                    </a>
                </div>

                <img src={moonImage} className="moon-image" />
            </div>
            
        </main>
    );
}
