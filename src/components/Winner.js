import React from 'react';
import { useSpring, animated, config } from 'react-spring';
import { Button } from '@blueprintjs/core';

import { getWinner } from '../utils';

const Winner = props => {
    const { players, socket } = props;

    players.sort((a, b) => {
        return b.score - a.score;
    });

    const playAgain = () => {
        const { room } = props;
        socket.emit('resetGame', room);
    }

    const styles = useSpring({
        config: config.wobbly,
        transform: 'scale(2.6)',
        from: {
            transform: 'scale(1)'
        },
        delay: 1000,
    })

    return <div className='Winner'>
        <animated.h2 style={styles}>{getWinner(players)}</animated.h2>
        <Button
            onClick={playAgain}
            text="FUCK THAT SHIT, RUN IT BACK!"
            className='bp3-fill bp3-large bp3-intent-success'
        />
    </div>
};

export default Winner;
