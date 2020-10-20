import React, { PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import _ from 'lodash';

import { isInGame, promptSubmitted, getMe } from '../utils.js';
import Prompt from './Prompt';
import Guess from './Guess';
import PlayerScore from './PlayerScore';
import Disconnected from './Disconnected';
import Title from './Title';
import End from './End';

class Play extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            showScore: false,
            showEnd: false,
            name: null,
        }
    }

    componentDidMount() {
        const { socket, players, room } = this.props;

        socket.on('deviceWake', id => {
            const { name } = this.state;
            socket.emit('updatePlayerId', room, name, id);
        });

        const me = getMe(socket.id, players);
        if (_.isNil(me))
            return;

        this.setState({ name: me.name });

    }

    componentDidUpdate(prevProps) {
        const { round } = this.props;
        if (round !== prevProps.round) {
            if (round === 2) {
                this.setState({ showScore: true });
                setTimeout(() => { this.setState({ showScore: false }) }, 6000);
            } else if (round === null) {
                this.setState({ showEnd: true });
            } else {
                this.setState({ showEnd: false });
            }
        }
    }

    render() {
        const { showScore, showEnd } = this.state;
        const { socket, players, started, prompts, round, disconnected } = this.props;
        return <div className='Play'>
            {!isInGame(socket.id, players) && <Redirect to='/join' />}

            <div className='container'>
                {disconnected
                    ? <Disconnected title={true} />
                    : promptSubmitted(socket.id, players)
                        ? started
                            ? !!prompts.length
                                ? <Guess {...this.props} />
                                : <PlayerScore {...this.props} />
                            : <>
                                <Title />
                                <h2>Waiting for round {round} to begin</h2>
                            </>
                        : showScore
                            ? <PlayerScore {...this.props} />
                            : showEnd
                                ? <End {...this.props} />
                                : <Prompt {...this.props} />
                }
            </div>
        </div>;
    }   
}

export default Play;
