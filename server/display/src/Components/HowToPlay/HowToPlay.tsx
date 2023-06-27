import { useEffect, useState, useContext, useRef } from 'react';
import { SliderPicker, ColorResult } from 'react-color';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data'
import { ConfigContext } from '../../Contexts/ConfigContext';
import { ServerConfig } from '../../Models/serverConfig';
import archiSchema from './architecture.png';
import rankingImg from './ranking.png';
import trainingVideo from './training.webm';
import monitoringVideo from './monitoring.webm';
import './HowToPlay.css';

export default function HowToPlay() {
    const serverConfig = useContext(ConfigContext) as ServerConfig;
    const [color, setColor] = useState<string>('#000000');
    const [currentTab, setCurrentTab] = useState<string>('context');
    const [isScrolled, setIsScrolled] = useState(false); // to display the tabs section shadow when scrolled
    const heroSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (Object.keys(serverConfig).length) {
            console.log(serverConfig);
        }

        const handleScroll = () => {
            if (heroSectionRef.current) {
                const scrollThreshold = heroSectionRef.current.clientHeight;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                setIsScrolled(scrollTop > scrollThreshold);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, [serverConfig]);

    const setPickedColor = (colorData: ColorResult) => {
        navigator.clipboard.writeText(colorData.hex);
        setColor(colorData.hex);
    }

    const setPickedEmoji = (emojiData: any) => {
        navigator.clipboard.writeText(emojiData.native);
    }

    return (
        <main className="howtoplay-main-container">
            <div className="howtoplay-content">
                <section id="hero-section" className="hero is-link" ref={ heroSectionRef }>
                    <div className="container">
                        <div className="hero-body">
                            <h1 className="title is-1">SUPER LUNAR LANDER 🚀</h1>
                            <h2 className="subtitle is-2">Guide de démarrage</h2>
                        </div>
                    </div>
                </section>

                <section id="tabs-section" className={`section ${isScrolled ? 'with-shadow' : null}`}>
                    <div className="tabs is-centered">
                        <ul>
                            <li className={`${currentTab === 'context' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('context') }>Contexte 💡</a>
                            </li>
                            <li className={`${currentTab === 'setup' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('setup') }>Installation 💻</a>
                            </li>
                            <li className={`${currentTab === 'customization' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('customization') }>Customization 🎨</a>
                            </li>
                            <li className={`${currentTab === 'gameplay' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('gameplay') }>Comment jouer 🕹️</a>
                            </li>
                            <li className={`${currentTab === 'rules' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('rules') }>Règles du jeu 📜</a>
                            </li>
                            <li className={`${currentTab === 'ranking' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('ranking') }>Classement 🏆</a>
                            </li>
                            <li className={`${currentTab === 'training' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('training') }>Training 🧪</a>
                            </li>
                            <li className={`${currentTab === 'monitoring' ? 'is-active' : null}`}>
                                <a onClick={ () => setCurrentTab('monitoring') }>Monitoring 📺</a>
                            </li>
                        </ul>
                    </div>
                </section>

                <section id="context-section" className={`section ${currentTab !== 'context' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Contexte 💡</h3>
                            <div className="block">
                                <p>
                                    Ce <strong>coding contest</strong> est un <strong>jeu multijoueur en temps réel</strong>.
                                    Il est composé de deux parties :
                                </p>
                                <ul>
                                    <li>
                                        Un <strong>client</strong>, qui est le programme que <strong>vous</strong> allez coder.
                                    </li>
                                    <li>
                                        Un <strong>serveur</strong>, qui est le programme qui va gérer le jeu.
                                    </li>
                                </ul>
                            </div>
                            <div className="block">
                                Le <strong>serveur du jeu</strong> est un serveur HTTP servant des pages web,
                                il est également un <strong>serveur Websocket</strong> (Socket.IO pour être précis).
                                <br />
                                En tant que joueur, vous êtes un client qui allez vous connecter à ce serveur, et envoyer des commandes pour contrôler votre vaisseau.
                            </div>
                            <div className="block">
                                <img src={archiSchema} alt="architecture-du-jeu" height="800px" />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="setup-section" className={`section ${currentTab !== 'setup' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Installation 💻</h3>
                            <div className="block">
                                <h4 className="title is-4">Pré-requis</h4>
                                <p>
                                    Ce projet utilise <strong>NodeJS</strong> pour fonctionner.
                                    <br/>
                                    Vous pouvez vérifier que vous avez bien les prérequis en lançant la commande suivante :
                                </p>
                                <ul>
                                    <li>
                                        <code>node -v</code>
                                        <br />
                                        Si vous avez une version <code>&ge;16.X.X</code> qui s'affiche, c'est que NodeJS est bien installé.
                                    </li>
                                </ul>
                                <div className="notification is-info">
                                    Le projet est configuré avec <a href="https://volta.sh/"><strong>Volta ⚡</strong></a>.
                                    <br/>Si vous l'avez d'installé, vous n'avez rien à faire, il s'occupe de tout.
                                </div>
                                <p>
                                    Si vous n'avez pas NodeJS sur votre machine,
                                    et que vous n'avez pas internet pour une raison obscure : c'est un manque de chance 😬
                                </p>
                            </div>
                            <div className="block">
                                <h4 className="title is-4">Récupération du projet</h4>
                                <p>
                                    Il existe deux façons de récupérer le projet :
                                </p>
                                <ul>
                                    <li>
                                        <strong>ZIP</strong>
                                        <br />  
                                        Vous pouvez télécharger le projet au format ZIP en cliquant <a href="http://localhost/client.zip" download target="_blank">ici</a>.
                                        <br/>
                                    </li>
                                    <li>
                                        <strong>Github</strong>
                                        <br />
                                        Vous pouvez également cloner le projet en utilisant la commande suivante :
                                        <br />
                                        <code>git clone https://github.com/Firnael/lunar-lander</code>
                                        <br/>
                                        En tant que joueur, c'est le dossier <code>client</code> qui vous intéresse.
                                    </li>
                                </ul>
                            </div>
                            <div className="block">
                                <h4 className="title is-4">Lancement</h4>
                                <p>
                                    En ouvrant le dossier <code>client</code> vous trouverez quelques fichiers et dossiers.
                                    <br/>
                                    Celui qui nous intéresse est <code>app.ts</code>.
                                    <br/>
                                    C'est en modifiant le code à l'intérieur de ce fichier que vous allez pouvoir <strong>envoyer des commandes à votre vaisseau</strong>, nous en parlerons juste après.
                                    <br/>
                                    <br/>
                                    Pour lancer le client, vous devez taper les commandes suivantes dans un terminal :
                                </p>
                                <pre>
                                    <code>
                                        cd client     # positionnez vous dans le dossier client
                                        <br/>
                                        npm install   # (uniquement si vous avez récupérer le projet via Github), installez les dépendances 
                                        <br/>
                                        npm run dev   # lancez le programme
                                    </code>
                                </pre>
                                <br/>
                                Le client redémarrera automatiquement à chaque modification dans le code (grâce à <a href="https://www.npmjs.com/package/nodemon">nodemon</a>).
                            </div>
                        </div>
                    </div>
                </section>

                <section id="customization-section" className={`section ${currentTab !== 'customization' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Customization 🎨</h3>
                            <div className="columns">
                                <div className="column">
                                    <div className="block">
                                        Vous pouvez (et êtes même encouragé) à personnaliser votre vaisseau en modifiant
                                        les variables se trouvant en haut du fichier <code>app.ts</code> :
                                    </div>
                                    <div className="block">
                                        <pre>
                                            <code>
                                                const PLAYER_NAME = process.env.PLAYER_NAME || 'VOTRE_NOM';
                                                <br/>
                                                const PLAYER_EMOJI = process.env.PLAYER_EMOJI || '💩';
                                                <br/>
                                                const PLAYER_COLOR = process.env.PLAYER_COLOR || 'FFFFFF';
                                            </code>
                                        </pre>
                                        <br/>
                                    </div>
                                    <div className="block">
                                        <ul>
                                            <li>
                                                <strong>NAME</strong>
                                                <br/>
                                                Votre nom, s'affiche au dessus de votre vaisseau, ainsi que dans le classement.
                                                <br/>
                                                Il est limité à <strong>12 charactères</strong>
                                            </li>
                                            <li>
                                                <strong>EMOJI</strong>
                                                <br/>
                                                Votre emoji, s'affiche sur votre drapeau lorsque vous réussissez un atterrissage.
                                                <br/>
                                                Vous êtes limité à <strong>1 symbole</strong>
                                            </li>
                                            <li>
                                                <strong>COLOR</strong>
                                                <br/>
                                                Votre couleur, s'affiche autour de votre vaisseau et de votre nom en tout temps.
                                                <br/>
                                                Pensez à <strong>retirer le <code>#</code></strong>, ne gardez que les charactères hexadécimaux.
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="block">
                                        Vous pouvez si vous le souhaitez fournir ces valeurs via des <strong>variables d'environnement</strong>.
                                    </div>
                                </div>
                                <div className="column">
                                    <p>
                                        Un clic sur une couleur ou un emoji le place dans votre presse-papier 📋
                                        <br/>
                                        il ne vous reste plus qu'à le coller dans votre code !
                                    </p>
                                    <div className="block">
                                        <br/>
                                        <SliderPicker color={ color } onChangeComplete={ setPickedColor }/>
                                        </div>
                                    <div className="block">
                                        <br/>
                                        <Picker locale="fr" navPosition="none" previewPosition="none" maxFrequentRows="0" perLine="12"
                                            data={ data } onEmojiSelect={ setPickedEmoji }/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="gameplay-section" className={`section ${currentTab !== 'gameplay' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Comment jouer 🕹️</h3>
                            <div className="block">
                                Le but de ce jeu est d'implémenter <strong>un algorithme</strong> qui permettra à votre vaisseau d'atterir sur
                                la Lune 🌝 sans exploser.
                            </div>
                            <div className="block">
                                <h4 className="title is-4">Dans quel état début le jeu ?</h4>
                                Votre vaisseau apparait en haut de l'écran, il est en chute libre, et a une vitesse linéaire et angulaire aléatoire.
                                <br/>
                                Grosso-modo : il tombe et tourne sur lui-même.
                            </div>
                            <div className="block">
                                <h4 className="title is-4">Comment je pilote mon vaisseau ?</h4>
                                Il vous faudra compléter le callback de la fonction <code>io.handleLander()</code> du fichier <code>app.ts</code>.
                                <div className="columns">
                                    <div className="column">
                                    Le serveur de jeu vous envoie les informations de télémétrie relative à votre vaisseau.
                                        <br/>
                                        La fréquence d'envoi est réglée sur <span className="tag is-warning"><strong>{ serverConfig.SIMULATION_DATA_HEART_BEAT_RATE } ms</strong></span>
                                        <br/>
                                        <br/>
                                        Votre fonction doit retourner un objet <code>actions</code> comme suit :
                                        <br/>
                                        <pre>
                                            <code>
                                                const actions = &#123;
                                                <br/>
                                                &nbsp;&nbsp;thrust: false,
                                                <br/>
                                                &nbsp;&nbsp;rotate: LanderRotation.NONE
                                                <br/>
                                                &#125;
                                            </code>
                                        </pre>
                                    </div>
                                    <div className="column">
                                        <ul>
                                            <li>
                                                la propriété <code>thrust</code> détermine l'état du <strong>moteur de poussée</strong> de votre vaisseau.
                                                <br/>
                                                -  à <code>true</code>, il s'allume, et votre vaisseau <strong>accélère</strong>. 
                                                <br/>
                                                -  à <code>false</code>, il s'éteint, votre vaisseau <strong>dérive</strong> (il est affecté par la gravité, mais ne perd que très peu de vitesse, la Lune n'ayant pas d'atmosphère).
                                            </li>
                                            <li>
                                                la propriété <code>rotate</code> détermine l'état des <strong>moteurs de stabilisation</strong> de votre vaisseau.
                                                <br/>
                                                - à <code>CLOCKWISE</code>, le moteur <strong>gauche</strong> s'allume et votre vaisseau tourne vers la droite.
                                                <br/>
                                                - à <code>COUNTER_CLOCKWISE</code>, le moteur <strong>droit</strong> s'allume et votre vaisseau tourne vers la gauche.
                                                <br/>
                                                - à <code>NONE</code>, les deux moteurs s'éteignent et votre vaisseau <strong>arrête de tourner</strong>.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                C'est à <strong>vous</strong> de déterminer les bonnes valeurs à envoyer au serveur
                                à chaque instant pour éviter le crash !
                            </div>
                            <div className="block">
                                <h4 className="title is-4">Comment je connais l'état de mon vaisseau ?</h4>
                                Le serveur de jeu vous envoie (toutes les { serverConfig.SIMULATION_DATA_HEART_BEAT_RATE } ms) les informations de télémétrie relative à votre vaisseau.
                                <div className="columns">
                                    <div className="column">
                                        <ul>
                                            <li>
                                                <code>angle</code> : l'angle de rotation du vaisseau
                                                <br/>
                                                - <code>0</code> si le vaisseau pointe vers <strong>le haut</strong>   
                                                <br/>
                                                - <code>-90</code> si le vaisseau pointe vers la gauche<br/>
                                                - <code>90</code> si le vaisseau pointe vers la droite<br/>
                                                - <code>+/-180</code> si le vaisseau pointe vers le bas
                                            </li>
                                            <li>
                                                <code>vx</code> : vélocité horizontale
                                                <br/>
                                                - est <strong>positive</strong> lorsque le vaisseau se déplace vers la <strong>droite</strong>
                                                <br/>
                                                - est <strong>négative</strong> lorsque le vaisseau se déplace vers la <strong>gauche</strong>
                                            </li>
                                            <li>
                                                <code>vy</code> : vélocité verticale
                                                <br/>
                                                - est <strong>positive</strong> lorsque le vaisseau se déplace vers le <strong>bas</strong>
                                                <br/>
                                                - est <strong>négative</strong> lorsque le vaisseau se déplace vers le <strong>haut</strong>
                                            </li>
                                            <li>
                                                <code>va</code> : vélocité angulaire (ℹ️ actuellement { serverConfig.USE_ANGULAR_ACCELERATION ? 'activée' : 'désactivée' })
                                                <br/>
                                                - est <strong>positive</strong> lorsque le vaisseau est en rotation vers la <strong>droite</strong>
                                                <br/>
                                                - est <strong>négative</strong> lorsque le vaisseau est en rotation vers la <strong>gauche</strong>
                                            </li>
                                            <li>
                                                <code>altitude</code> : distance entre votre vaisseau et le sol lunaire
                                            </li>
                                            <li>
                                                <code>usedFuel</code> : la quantité de carburant utilisée lors de la tentative d'atterrissage en cours
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="column">
                                        <ul>
                                            <li>
                                                <code>status</code> : le statut actuel de votre vaisseau :
                                                <br/>
                                                - 0 : SPAWNED, votre vaisseau vient d'apparaître (ou de réapparaître)
                                                <br/>
                                                - 1 : ALIVE, votre vaisseau est en cours de vol, tout va bien (pour le moment)
                                                <br/>
                                                - 2 : LANDED, votre vaisseau à atterri 🎉 ! Il réapparaîtra dans quelques secondes
                                                <br/>
                                                - 3 : CRASHED, votre vaisseau à explosé 😱 ! Il réapparaîtra dans quelques secondes.
                                            </li>
                                            <li>
                                                <code>dangerStatus</code> : l'état de danger actuel de votre vaisseau :
                                                <br/>
                                                - 0 : SAFE, votre vaisseau est en sécurité (pour le moment)
                                                <br/>
                                                - 1 : BAD_ANGLE, l'angle d'inclinaison de votre vaisseau avec le sol est trop grand pour atterrir !
                                                <br/>
                                                - 2 : TOO_FAST_X, votre vaisseau va trop vite horizontalement pour atterrir !
                                                <br/>
                                                - 4 : TOO_FAST_Y, votre vaisseau va trop vite verticalement pour atterrir !
                                                <br/>
                                                <br/>
                                                ℹ️ Cette dernière information est encodée en <strong>binaire</strong>, et peut donc prendre plusieurs valeurs en même temps.
                                                <br/>
                                                Par exemple, si votre vaisseau va trop vite verticalement, et qu'il a un trop grand angle avec le sol,
                                                <br/>
                                                <code>dangerStatus</code> vaudra <code>5</code> (1+4).
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="rules-section" className={`section ${currentTab !== 'rules' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Règles du jeu 📜</h3>
                            <div className="block">
                                <h4 className="title is-4">Limites à l'atterissage</h4>
                                <p>
                                    Pour que votre vaisseau <strong>se pose sans encombres</strong>, il devra respecter une limite de vitesse et d'angle au moment où il touche le sol.
                                    <br/>
                                    Ne pas respecter ses limites entrainera des <strong>dégats irréversibles</strong> (en fait il explosera).
                                    Ces valeurs sont :
                                </p>
                                <ul>
                                    <li>
                                        <code>vx</code> : doit être comprise entre <strong>-{ serverConfig.LANDING_MAX_VELOCITY_X }</strong> et <strong>{ serverConfig.LANDING_MAX_VELOCITY_X }</strong>
                                    </li>
                                    <li>
                                        <code>vy</code> : doit être comprise entre <strong>-{ serverConfig.LANDING_MAX_VELOCITY_Y }</strong> et <strong>{ serverConfig.LANDING_MAX_VELOCITY_Y }</strong>
                                    </li>
                                    <li>
                                        <code>ang</code> : doit être compris entre <strong>-{ serverConfig.LANDING_MAX_ANGLE }°</strong> et <strong>{ serverConfig.LANDING_MAX_ANGLE }°</strong>
                                    </li>
                                </ul>
                                <p>
                                    Un pictogramme <span className="tag is-danger">⚠️</span> s'affiche à partir du moment où votre vaisseau est <strong>en danger</strong> :
                                </p>
                                <ul>
                                    <li>s'il ne respecte pas au moins une des conditions d'atterissage</li>
                                    <li>et s'il se trouve à une altitude inférieure à <span className="tag is-warning"><strong>{ serverConfig.DANGER_ZONE_HEIGHT }</strong></span></li>
                                </ul>
                                <p>
                                    Vous serez alors dans la <a href="https://www.youtube.com/watch?v=siwpn14IE7E&ab_channel=KennyLogginsVEVO">DANGER ZONE !!!</a>
                                </p>
                            </div>
                            <div className="block">
                                <h4 className="title is-4">Gestion du carburant</h4>
                                <p>
                                    Votre vaisseau a également une quantité de carburant limitée,
                                    et sans carburant il devient incontrôlable, et part à la dérive !
                                    <br/>
                                    Cette limite est de <span className="tag is-warning"><strong>{ serverConfig.FUEL_TANK_SIZE }</strong></span> unités.
                                    <br/>
                                    <br/>
                                    Il est important de souligner que <strong>les différents moteurs ne consomment pas le carburant à la même vitesse</strong> :
                                </p>
                                <ul>
                                    <li>allumer le <strong>moteur principal</strong> (de poussée) consomme <span className="tag is-warning"><strong>{ 2 }</strong></span> unités de carburant par frame</li>
                                    <li>allumer un <strong>moteur auxiliaire</strong> (de rotation) consomme <span className="tag is-warning"><strong>{ 1 }</strong></span> unité de carburant par frame</li>
                                </ul>
                                <p>
                                    ℹ️ <strong>Un vaisseau qui explose perd tout son carburant</strong>, impactant votre classement !
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="ranking-section" className={`section ${currentTab !== 'ranking' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="columns">
                            <div className="column">
                                <div className="content">
                                    <h3 className="title is-3">Classement 🏆</h3>
                                    <div className="block">
                                        Réussir à poser son vaisseau, c'est bien, mais le faire de façon systématique, et optimisée, c'est mieux !
                                        <br/>
                                        Votre classement dépend de deux facteurs ✌️ :
                                        <ul>
                                            <li>
                                                <strong>Votre % d'atterissage réussi 🙌</strong>
                                                <br/>
                                                le nombre de fois où votre vaisseau s'est posé sans exploser / le nombre de tentatives
                                            </li>
                                            <li>
                                                <strong>Votre moyenne de carburant utilisé 🛢️</strong>
                                                <br/>
                                                la quantité de fuel utilisé par tentative / nombre de tentatives
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="block">
                                        <p>Ces deux élements sont utilisés pour classer les joueurs les uns par rapport aux autres selon la formule :</p>
                                        <pre>
                                            SuccessRate / UsedFueldAverage
                                        </pre>
                                        <p>
                                            ℹ️ Ce calcul est fait sur les <strong>20 derniers essais glissants</strong>.
                                            <br/>
                                            Si vous améliorez votre algorithme de manière progressive, votre classement devrait s'améliorer au fur et à mesure ! 
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="column">
                                <div className="message">
                                    <div className="message-header">
                                        Le classement en temps réel
                                    </div>
                                    <div className="message-body">
                                        <img src={rankingImg} alt="ranking" />
                                        <p>
                                            Dans cet exemple, le joueur <strong>Machoc</strong> est <strong>1er</strong> au classement car ses performances
                                            en terme de consommation de carburant (454 unité/essai) et de taux de réussite (91% d'atterrisage réussi) sont en moyenne meilleures que celles des autres joueurs.
                                        </p>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </section>

                <section id="training-section" className={`section ${currentTab !== 'training' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Mode : Entrainement 🧪</h3>
                            <div className="columns">
                                <div className="column">
                                    <div className="block">
                                        <p>
                                            Vous avez à votre disposition un environnement d'entraînement à l'atterrissage dans les mêmes conditions que sur la Lune !
                                            <br/>
                                            Ce mode de jeu est accessible <a href="/training" target="_blank">ICI</a>.
                                            <br/>
                                            <br/>
                                            Le vaisseau est pilotable <strong>à la main</strong> directement avec votre clavier ⌨️ :
                                        </p>
                                        <ul>
                                            <li>
                                                <code>Z</code> ou <code>⬆</code> : allumer le moteur principal
                                            </li>
                                            <li>
                                                <code>Q</code> ou <code>⬅</code> : allumer le moteur auxiliaire gauche
                                            </li>
                                            <li>
                                                <code>D</code> ou <code>⮕</code> : allumer le moteur auxiliaire droit
                                            </li>
                                        </ul>
                                        <div className="notification is-info">
                                            ℹ️ Les actions envoyées par le clavier sont affichées à l'écran,
                                            ce sont ces mêmes actions qui doivent être envoyées par votre algorithme.
                                        </div>
                                        <div className="notification is-warning">
                                            🚧 Cet outil est en cours de développement !
                                            Des trucs un peu moches peuvent survenir.
                                        </div>
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="message">
                                        <div className="message-header">
                                            <p>Le mode entraînement</p>
                                        </div>
                                        <div className="message-body">
                                            <video controls autoPlay loop muted>
                                                <source src={trainingVideo} type="video/webm" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="monitoring-section" className={`section ${currentTab !== 'monitoring' ? 'is-hidden' : null}`}>
                    <div className="container">
                        <div className="content">
                            <h3 className="title is-3">Monitoring 📺</h3>
                            <div className="columns">
                                <div className="column">
                                    <div className="block">
                                        <strong>CROCLARCON INDUSTRIES</strong> met grâcieusement à votre disposition un TERMLINK dernière génération !
                                        <br/>
                                        Cet <a href="/monitoring" target="_blank">écran</a> vous permet de suivre en quasi-réel ce qu'il se passe sur la Lune dans le confort de votre siège.
                                    </div>
                                    <div className="block">
                                        Pour ouvrir une unité de monitoring, il suffit de cliquer sur le bouton comportant le nom du joueur dans la fenêtre <strong>PLAYERS</strong>.
                                    </div>
                                    <div className="block">
                                        Il est possible d'agrandir / de rétrécir et de fermer ces unités à l'aide des boutons en haut à gauche de chacune d'elles.
                                    </div>
                                    <div className="block">
                                        La fenêtres <strong>PLAYERS</strong> est paginée, il est possible de naviguer entre les différentes pages avec les flèches de navigation situées en bas.
                                        <br/>
                                        Si vous ne trouvez pas votre nom, c'est certainement qu'il est sur une autre page.
                                    </div>
                                </div>
                                <div className="column">
                                    <div className="message">
                                        <div className="message-header">
                                            <p>L'écran de monitoring</p>
                                        </div>
                                        <div className="message-body">
                                            <div className="columns">
                                                <div className="column">
                                                <video controls autoPlay loop muted>
                                                    <source src={monitoringVideo} type="video/webm" />
                                                    Your browser does not support the video tag.
                                                </video>
                                                </div>
                                                <div className="column">
                                                    Ici, le joueur <strong>Croc</strong> admire son vaisseau en train de se crasher.
                                                    <br/>
                                                    Les information de télémétrie sont affichées en différentes couleurs en fonction de la dangerosité de la situation : 
                                                    <ul>
                                                        <li>
                                                            <span className="tag is-light"><strong>Blanc</strong></span> : la situation ne présente aucun danger immédiat
                                                        </li>
                                                        <li>
                                                            <span className="tag is-warning"><strong>Jaune</strong></span> : des corrections de trajectoire vont être nécessaires, mais le vaisseau est encore loin du sol
                                                        </li>
                                                        <li>
                                                            <span className="tag is-danger"><strong>Rouge</strong></span> : si aucune action n'est prise, le vaisseau va s'écraser
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="footer">
                <div className="content has-text-centered">
                    <p>
                        <strong>Lunar Lander 🚀</strong> by <a href="https://github.com/Firnael">Audren Burlot</a>.
                        The source code is licensed <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
                        <br/>
                        CSS by <a href="https://bulma.io/">Bulma</a>.
                    </p>
                </div>
            </footer>
        </main>
    );
}
