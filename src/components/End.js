import React from 'react';
import { useSpring, animated } from 'react-spring';

import { didIWin } from '../utils';

const End = props => {
    const { socket, players } = props;
    const me = players.find(p => p.id === socket.id);
    const { score } = me;
    const winning = didIWin(socket.id, players);

    const styles = useSpring({
        transform: 'translateY(0)',
        opacity: 1,
        from: {
            transform: 'translateY(400px)',
            opacity: 0,
        },
        delay: 1000
    });

    return <div className='End'>
        {winning
            ? <>
                <h1>WINNING</h1>
                <animated.h2 style={styles}>{score} points, nice!</animated.h2>
            </>
            : <>
                <h1>Fuckin Loser</h1>
                <animated.h2 style={styles}>Only {score} points, are you serious?</animated.h2>
            </>
        }
    </div>;
};

export default End;
