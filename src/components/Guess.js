import React, { PureComponent } from 'react';
import { InputGroup, Button, Text, Alert } from '@blueprintjs/core';

import Reveal from './Reveal';
import PlayerList from './PlayerList';
import GetReady from './GetReady';

class Guess extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            submittedResponse: false,
            guess: null,
            alertShown: false,
            errorMessage: null,
            ready: false,
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({ ready: true });
        }, 4000);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.prompts.length !== this.props.prompts.length) {
            this.setState({
                submittedResponse: false,
                guess: null,
            });
        }
    }

    handleForm = e => {
        e.preventDefault();

        const { players, socket, room } = this.props;
        const guess = e.target.guess.value.trim();

        if (guess === '') {
            this.setState({ alertShown: true, errorMessage: 'Submit a number' });
            return;
        }

        if (guess < 0) {
            this.setState({ alertShown: true, errorMessage: 'Number must be at least 0' });
            return;
        }

        if (guess > players.length) {
            this.setState({ alertShown: true, errorMessage: "There aren't that many players!" });
            return;
        }

        if (isNaN(guess)) {
            this.setState({ alertShown: true, errorMessage: "Bruh, guess a NUMBER" });
            return;
        }

        this.setState({ guess }, () => socket.emit('submitGuess', room, socket.id));
    }

    sendResponse = (me, prompt) => {
        const { socket, room } = this.props;
        this.setState({ submittedResponse: true }, () => {
            socket.emit('sendResponse', room, socket.id, me, prompt);
            document.querySelector('input').focus();
        });
    }

    render() {
        const { submittedResponse, alertShown, errorMessage, guess, ready } = this.state;
        const { prompts, players, revealed } = this.props;

        return <div className='Guess'>
            {ready
                ? <>

                <h2>Who among us {prompts[0].prompt}?</h2>
                {!revealed
                    ? <>
                        {!submittedResponse
                            ? <>
                                <Button
                                    className='bp3-large bp3-fill bp3-intent-success'
                                    text='ME'
                                    onClick={() => this.sendResponse(true, prompts[0].prompt)}
                                />
                                <Button
                                    className='bp3-large bp3-fill bp3-intent-danger'
                                    text='NOT ME'
                                    onClick={() => this.sendResponse(false, prompts[0].prompt)}
                                />
                            </>
                            : <>
                                <form onSubmit={e => this.handleForm(e)}>
                                    <InputGroup
                                        type='number'
                                        name='guess'
                                        maxLength='1'
                                        placeholder={`How many of the ${players.length} of us?`}
                                        disabled={guess !== null}
                                    />
                                    <Button
                                        type='submit'
                                        text='Submit'
                                        className='bp3-large bp3-fill'
                                        disabled={guess !== null}
                                    />
                                </form>
                                <PlayerList {...this.props} />
                            </>
                        }
                        <Alert
                            isOpen={alertShown}
                            onClose={() => this.setState({ alertShown: false, errorMessage: null }, () => document.querySelector('input').focus())}
                            canEscapeKeyCancel={true}
                            canOutsideClickCancel={true}
                            icon='error'
                        >
                            <Text>{errorMessage}</Text>
                        </Alert>
                    </>
                    : <Reveal {...this.props} {...this.state} />
                }
                </>
                : <GetReady />
            }
        </div>;
    }   
}

export default Guess;
