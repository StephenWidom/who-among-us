import React from 'react';
import socketIOClient from 'socket.io-client';
import { Switch, Route, withRouter } from 'react-router-dom';

import Join from './components/Join';
import Host from './components/Host';
import Landing from './components/Landing';
import Play from './components/Play';

import './App.scss';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            room: null,
            players: [],
            started: false,
            prompts: [],
            joinError: null,
            disconnected: false,
            round: 1,
            hostError: null,
            host: false,
            revealed: false,
        };
        this.socket = socketIOClient(process.env.REACT_APP_ADDR);
    }

    componentDidMount() {
        // Get and set the room code
        this.socket.on('setRoomCode', room => this.setState({ room }));
        
        // Anytime a player joins
        this.socket.on('updatePlayers', players => this.setState({ players }));

        // When a player submits a prompt
        this.socket.on('updatePrompts', prompts => this.setState({ prompts }));

        // If there was an error reported from the socket server
        this.socket.on('errorJoining', joinError => this.setState({ joinError }));

        // Once a player has successfully joined
        this.socket.on('goToPrompt', room => { this.setState({ room }, () => {
            this.props.history.push('/play'); });
        });

        // Game has been started
        this.socket.on('gameStarted', started => { this.setState({ started }); });

        // Player has disconnected
        this.socket.on('bootedPlayer', () => {
            this.setState({ disconnected: true });
            this.socket.disconnect(true);
        });

        // Round has been updated
        this.socket.on('updateRound', round => this.setState({ round }));

        // Error hosting the game, i.e. someone already is
        this.socket.on('hostError', hostError => this.setState({ hostError }));

        // Successfully hosted a bish
        this.socket.on('gameHosted', room => { this.setState({ host: true, room }, () => {
            this.props.history.push('/host'); });
        });

        this.socket.on('answerRevealed', revealed => this.setState({ revealed }));
    }

    render() {
        return <div className='App'>
            <Switch>
                <Route path='/join'>
                    <Join
                        socket={this.socket}
                        {...this.state}
                    />
                </Route>
                <Route path='/play'>
                    <Play
                        socket={this.socket}
                        {...this.state}
                    />
                </Route>
                <Route path='/host'>
                    <Host 
                        socket={this.socket}
                        {...this.state}
                    />
                </Route>
                <Route path='/'>
                    <Landing
                        socket={this.socket}
                        {...this.state}
                    />
                </Route>
            </Switch>
        </div>;
    }
}

export default withRouter(App);
