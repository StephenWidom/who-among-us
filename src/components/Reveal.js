import React, { useEffect } from 'react';
import { useSpring, animated } from 'react-spring';

import { getScore } from '../utils';

const Reveal = props => {
    const { prompts, socket, guess, round } = props;
    const prompt = prompts[0];
    const score = getScore(prompt.number, guess, round);

    const styles = useSpring({
        transform: 'scale(1)',
        from: {
            transform: 'scale(0)'
        }
    });

    const scoreStyles = useSpring({
        delay: 1500,
        transform: 'scale(1)',
        from: {
            transform: 'scale(0)'
        }
    })

    useEffect(() => { // Use like componentDidMount
        // Send score to socket server
        socket.emit('sendScore', socket.id, score);
    }, []);

    return <animated.div className='Reveal' style={styles}>
        <h1>{prompt.number} of us</h1>
        <animated.h2 style={scoreStyles} className={`${score >= 0 ? 'positive' : 'negative'}`}>{`${score >= 0 && '+'} ${score} points`}</animated.h2>
    </animated.div>;
};

export default Reveal;
