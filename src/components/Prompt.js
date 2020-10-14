import React, { PureComponent } from 'react';
import _ from 'lodash';
import { InputGroup, Button, Text, Alert } from '@blueprintjs/core';
import { examplePrompts } from '../utils.js';

class Prompt extends PureComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            alertShown: false,
            errorMessage: null,
        };
        this.examples = _.shuffle(examplePrompts).slice(0, 3);
    }

    componentDidMount() {
        this.form = document.querySelector('form');
        this.form.prompt.focus();
    }

    handleForm = e => {
        e.preventDefault();

        const { prompt } = e.target;
        const { socket, prompts } = this.props;
        const nicePrompt = prompt.value.trim().replace('?', '').toUpperCase();

        if (nicePrompt === '')
            return;

        if (prompts.some(p => p.prompt === nicePrompt)) {
            this.setState({ alertShown: true, errorMessage: 'Someone submitted that one already!' });
            return;
        }

        // Send the prompt to the socket server, trimmed
        socket.emit('submitPrompt', socket.id, nicePrompt);
    }

    copyExample = example => {
        const form = document.querySelector('form');
        form.prompt.value = example;
    }

    render() {
        const { alertShown, errorMessage } = this.state;
        return <div className='Prompt'>
            <h1>Complete the Prompt</h1>
            <h2>Who among us...</h2>
            <form onSubmit={e => this.handleForm(e)}>
                <InputGroup
                    type='text'
                    maxLength='55'
                    name='prompt'
                />
                <Button
                    type='submit'
                    text='Submit'
                    className='bp3-large bp3-fill bp3-intent-primary'
                />
            </form>
            <div className='example'>
                <h3>For example:</h3>
                {this.examples.map(example => <p key={example} onClick={() => this.copyExample(example)}>{example}</p>)}
            </div>
            <Alert
                isOpen={alertShown}
                onClose={() => this.setState({ alertShown: false, errorMessage: null }, () => this.form.prompt.focus())}
                canEscapeKeyCancel={true}
                canOutsideClickCancel={true}
                icon='error'
            >
                <Text>{errorMessage}</Text>
            </Alert>
        </div>;
    }      
};

export default Prompt;
