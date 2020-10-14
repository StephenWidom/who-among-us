import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Howl } from 'howler';

import Game from './Game';
import Wait from './Wait';
import Score from './Score';

import Music from '../audio/music.mp3';
import Timer from '../audio/timer.mp3';
import GetReady from '../audio/ready.mp3';
import Ding from '../audio/ding.mp3';
import RoundOver from '../audio/roundover.mp3';
import Cheer1 from '../audio/cheer1.mp3';
import Cheer2 from '../audio/cheer2.mp3';
import Cheer3 from '../audio/cheer3.mp3';
import Hello1 from '../audio/hello1.mp3';
import Hello2 from '../audio/hello2.mp3';
import Hello3 from '../audio/hello3.mp3';
import Hello4 from '../audio/hello4.mp3';
import Hello5 from '../audio/hello5.mp3';

const Host = props => {
    const { started, prompts, host, round } = props;

    // Sound effects
    const music = new Howl({ src: [Music], volume: 0.8, loop: true });
    const timer = new Howl({ src: [Timer], volume: 0.5 });
    const getready = new Howl({ src: [GetReady] });
    const ding = new Howl({ src: [Ding] });
    const roundover = new Howl({ src: [RoundOver] });
    const cheer1 = new Howl({ src: [Cheer1] });
    const cheer2 = new Howl({ src: [Cheer2] });
    const cheer3 = new Howl({ src: [Cheer3] });
    const hello1 = new Howl({ src: [Hello1] });
    const hello2 = new Howl({ src: [Hello2] });
    const hello3 = new Howl({ src: [Hello3] });
    const hello4 = new Howl({ src: [Hello4] });
    const hello5 = new Howl({ src: [Hello5] });

    return <div className='Host'>
        {!host && <Redirect to='/' />}
        <div className='container'>
            {!started && round === 1
                ? <Wait
                    {...props}
                    music={music}
                    hello1={hello1}
                    hello2={hello2}
                    hello3={hello3}
                    hello4={hello4}
                    hello5={hello5}
                />
                : started && !!prompts.length
                    ? <Game
                        {...props}
                        timer={timer}
                        getready={getready}
                        ding={ding}
                        music={music}
                    />
                    : <Score
                        {...props}
                        roundover={roundover}
                        cheer1={cheer1}
                        cheer2={cheer2}
                        cheer3={cheer3}
                    />
            }
        </div>
    </div>;
}

export default Host;
