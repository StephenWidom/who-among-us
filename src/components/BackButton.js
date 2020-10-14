import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@blueprintjs/core';

const BackButton = props => {
    return <div className='BackButton'>
        <Link to='/'>
            <Icon icon='chevron-left' iconSize={40} />
        </Link>
    </div>;
}

export default BackButton;
