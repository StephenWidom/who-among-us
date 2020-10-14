import React from 'react';
import { useSpring, animated } from 'react-spring';

const Timer = props => {
    const styles = useSpring({
        config: {
            duration: 900,
        },
        opacity: 0,
        fontSize: 140,
        from: {
            opacity: 1,
            fontSize: 300,
        },
        reset: true,
    });

    return <animated.div className='Timer' style={styles}>
        {props.timer || 'X'}
    </animated.div>;
};

export default Timer;
