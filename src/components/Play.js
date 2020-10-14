import React, { useEffect, useRef } from 'react';
import { Redirect } from 'react-router-dom';

import { isInGame, promptSubmitted } from '../utils.js';
import Prompt from './Prompt';
import Guess from './Guess';
import PlayerScore from './PlayerScore';
import Disconnected from './Disconnected';
import Title from './Title';

const Play = props => {
    const { socket, players, started, prompts, round, disconnected } = props;
    const showScore = useRef(false);

    useEffect(round => {
        if (round === 2) {
            showScore.current = true;
            setTimeout(() => { showScore.current = false }, 5000);
        }
    }, [round]);

    return <div className='Play'>
        {!isInGame(socket.id, players) && <Redirect to='/join' />}

        <div className='container'>
            {disconnected
                ? <Disconnected title={true} />
                : promptSubmitted(socket.id, players)
                    ? started
                        ? !!prompts.length
                            ? <Guess {...props} />
                            : <PlayerScore {...props} />
                        : <>
                            <Title />
                            <h2>Waiting for round {round} to begin</h2>
                        </>
                    : showScore.current
                        ? <PlayerScore {...props} />
                        : <Prompt {...props} />
            }
        </div>
    </div>;
}

export default Play;
