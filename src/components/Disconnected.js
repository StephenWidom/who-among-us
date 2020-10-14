import React from 'react';
import Title from './Title';

const Disconnected = props => {
    const { title } = props;
    return <div className='Disconnected'>
        {title && <Title />}
        <h2>You have disconnected</h2>
        <h4>Please refresh the bish to rejoin</h4>
    </div>;
};

export default Disconnected;
