import React, { useEffect } from 'react';
import { Howler } from 'howler';
import { Link } from 'react-router-dom';
import { Button } from '@blueprintjs/core';
import randomstring from 'randomstring';

import Title from './Title';

const Landing = props => {
    const { hostError, socket } = props;

    const hostGame = () => {
        const room = generateRoomCode();
        socket.emit('joinSocketRoom', room, true, null, socket.id);
    }

    // Create a unique id for each game (room)
    const generateRoomCode = () => {
        const roomCode = randomstring.generate({
            length: 4,
            charset: 'alphabetic',
            readable: 'true',
            capitalization: 'uppercase',
        });
        return roomCode;
    }

    useEffect(() => {
        Howler.stop();
    }, []);

    return <div className='Landing'>
        <div className="container">
            <Title />
            <Link
                to='/join'
                className='bp3-button bp3-large bp3-intent-primary bp3-fill'
            >Join</Link>
            <Button
                className='bp3-large bp3-fill'
                text='Host'
                onClick={hostGame}
            />
            <h2>{hostError}</h2>
        </div>
    </div>;
};

export default Landing;
