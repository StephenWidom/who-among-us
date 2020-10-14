import React, { PureComponent } from 'react';
import { Howler } from 'howler';

import Timer from './Timer';
import GetReady from './GetReady';
import { allGuessesMade } from '../utils';

class Game extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            timer: 20,
            everyoneDone: false,
            ready: false,
        }
    }

    componentDidMount() {
        this.getReady();
    }

    componentDidUpdate(prevProps) {
        const { players, prompts } = this.props;
        if (prevProps.prompts.length !== prompts.length)
            this.startTimer();

        if (prevProps.players !== players && !this.state.everyoneDone) {
            this.setState({ everyoneDone: allGuessesMade(players) }, () => {
                if (this.state.everyoneDone)
                    this.endRound();
            });
        }
    }

    getReady = () => {
        const { getready } = this.props;
        getready.play();
        setTimeout(() => {
            this.setState({ ready: true }, () => { this.startTimer(); });
        }, 4000);
    }

    nextPrompt = () => {
        const { socket } = this.props;
        setTimeout(() => {
            this.setState({ everyoneDone: false }, () => {
                socket.emit('nextPrompt');
            });
        }, 7000);
    }

    startTimer = () => {
        const { timer } = this.props;
        this.setState({ timer: 20 }, () => { timer.play(); });
        this.timer = setInterval(() => {
            if (this.state.timer > 1) {
                this.setState(prevState => {
                    return {
                        timer: prevState.timer - 1
                    }
                });
            } else {
                this.endRound();
            }
        }, 1000);
    }

    endRound = () => {
        const { socket, ding } = this.props;
        clearInterval(this.timer);
        Howler.stop();
        socket.emit('revealAnswer');
        ding.play();
        this.nextPrompt();
    }

    render() {
        const { prompts, revealed } = this.props;
        const { timer, ready } = this.state;
        return <div className='Game'>
            <h1>Who among us</h1>
            {ready
                ? <>
                    <h2>{prompts[0].prompt}?</h2>
                    {revealed
                        ? <h1>{prompts[0].number} of us</h1>
                        : <Timer timer={timer} />
                    }
                </>
                : <GetReady />
            }
        </div>;
    }
};

export default Game;
