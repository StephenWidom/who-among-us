import React from 'react';

import { getPlayersButMe } from '../utils';

const PlayerList = props => {
    const { players, socket } = props;
    const list = getPlayersButMe(socket.id, players);
    return <div className='PlayerList'>
        <h3>Other Players</h3>
        {!!list.length && <ul>
            {list.map(p => <li>{p.name}</li>)}
        </ul>}
    </div>;
};

export default PlayerList;
