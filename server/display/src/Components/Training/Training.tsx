import { useState, useEffect, useContext } from 'react';
import { ConfigContext } from '../../Contexts/ConfigContext';
import { CustomGame } from '../../Game/Types/CustomGame';
import config from '../../Game/Config/CustomConfig';
import { PreloadScene } from '../../Game/Scenes/PreloadScene';
import { TrainingScene } from '../../Game/Scenes/TrainingScene';
import './Training.css';

export default function Training() {
    const [game, setGame] = useState<CustomGame>({} as CustomGame);
    const serverConfig = useContext(ConfigContext);

    useEffect(() => {
        if (Object.keys(serverConfig).length) {
            config.serverConfig = serverConfig;
            config.scene = [PreloadScene, TrainingScene];

            // create game
            const game: CustomGame = new CustomGame(config);
            setGame(game);
        }
    }, [serverConfig]);

    return (
        <main className="main-container">
            <div id="game" className="training-game-container" />
        </main>
    );
}
