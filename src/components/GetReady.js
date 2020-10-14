import React from 'react';
import { useSpring, animated } from 'react-spring';

const GetReady = props => {
    const styles = useSpring({
        transform: 'translateY(0)',
        from: {
            transform: 'translateY(-200px)'
        }
    });

    return <animated.div className='GetReady' style={styles}>
        <h2>Get Ready!</h2>
    </animated.div>;
};

export default GetReady;
