import React, { useEffect } from 'react';
import _ from 'lodash';
import { Button } from '@blueprintjs/core';

import Winner from './Winner';

const Score = props => {
    const { players, socket, round } = props;

    players.sort((a, b) => {
        return b.score - a.score;
    });

    useEffect(() => {
        const { roundover, round } = props;
        if (round === 1) {
            roundover.play();
        } else {
            const cheer = 'cheer' + _.random(1,3);
            props[cheer].play();
        }
    }, []);

    const startRoundTwo = () => {
        const { room } = props;
        socket.emit('startGame', room);
    }

    return <div className='Score'>
        <h1>Leaderboard</h1>
        {players.map(player => <div className={`player ${player.connected ? '' : 'disconnected'} ${player.promptSubmitted ? 'psubmitted' : ''}`} key={player.id}>
            <h4>{player.name}</h4>
            <div className='score'>{player.score}</div>
        </div>)}
        {round === 2
            ? <>
                <h2>Submit New Prompts!</h2>
                <Button
                    className='bp3-fill bp3-large bp3-intent-success'
                    text='Start Round Two'
                    onClick={startRoundTwo}
                />
            </>
            : <Winner {...props} />
        }
    </div>;
};

export default Score;
