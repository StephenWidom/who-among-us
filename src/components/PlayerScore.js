import React from 'react';

const PlayerScore = props => {
    const { players, socket } = props;
    const me = players.find(p => p.id === socket.id);

    players.sort((a, b) => {
        return b.score - a.score;
    });

    return <div className='PlayerScore'>
        <h1>Leaderboard</h1>
        {players.map(player => <div className={`player ${player.connected ? '' : 'disconnected'} ${player === me ? 'yaboi' : ''}`} key={player.id}>
            <h4>{player.name}</h4>
            <div className='score'>{player.score}</div>
        </div>)}
        <h2>Round two coming up</h2>
    </div>;
};

export default PlayerScore;
