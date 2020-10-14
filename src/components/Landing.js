import React, { useEffect } from 'react';
import { Howler } from 'howler';
import { Link } from 'react-router-dom';
import { Button } from '@blueprintjs/core';

import Title from './Title';

const Landing = props => {
    const { hostError, socket } = props;

    const hostGame = () => {
        socket.emit('joinSocketRoom', true, null, socket.id);
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
