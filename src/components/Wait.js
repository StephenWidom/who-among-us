import React, { useEffect, useRef } from 'react';
import { Button, Tooltip } from '@blueprintjs/core';
import _ from 'lodash';
import { Howler } from 'howler';

import { AppToaster } from './AppToaster';
import { allPromptsComplete } from '../utils';

const Wait = props => {
    const { players, socket, room } = props;
    const prevPlayers = useRef([]);
    const disabled = useRef(true);
    const isPlaying = useRef(false);

    if (!isPlaying.current) {
        isPlaying.current = true;
        props.music.play();
    }

    useEffect(() => {
        if (!players.length)
            return;

        if (prevPlayers.current.length !== players.length) {
            if (prevPlayers.current.length < players.length) {
                const newPlayer = players[players.length - 1];
                AppToaster.show({ message: `${newPlayer.name} joined!`, intent: 'success' });
                const hello = 'hello' + _.random(1, 5);
                props[hello].play();
            }
        }

        disabled.current = !allPromptsComplete(players);

        prevPlayers.current = players;

    }, [players]);

    const startGame = () => {
        const { room } = props;
        socket.emit('startGame', room);
        Howler.stop();
    }

    const bootPlayer = id => {
        const { room } = props;
        socket.emit('bootPlayer', room, id);
    }

    return <div className='Wait'>
        <div className="container">
            <h1>Who's In?</h1>
            <h2><span>Room:</span>{room}</h2>
            {!!players.length && (
                <ul className='Players'>
                    {players.map(player =>
                        <Tooltip key={player.id + 'boot'} content={`BOOT ${player.name}`}>
                            <li
                                key={player.id}
                                onClick={() => bootPlayer(player.id)}
                                className={`${player.promptSubmitted ? 'done' : ''}`}
                            >{player.name}</li>
                        </Tooltip>
                    )}
                </ul>
            )}
            <Button
                text='Go!'
                className='bp3-fill bp3-large bp3-intent-success'
                onClick={startGame}
                disabled={disabled.current}
            />
        </div>
    </div>;
};

export default Wait;
