import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { InputGroup, Alert, Button, Text } from '@blueprintjs/core';

import BackButton from './BackButton';
import Title from './Title';
import Disconnected from './Disconnected';

class Join extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            alertShown: false,
            errorMessage: null,
        };
    }

    componentDidMount() {
        const { disconnected } = this.props;

        if (disconnected)
            return;

        // Focus on form immediately
        this.form = document.querySelector('form');
        this.form.name.focus();
    }

    componentDidUpdate(prevProps) {
        // Check for error from socket server
        if (prevProps.joinError !== this.props.joinError) {
            const { joinError } = this.props;
            this.setState({
                errorMessage: joinError,
                alertShown: true,
            })
        }
    }

    makeUppercase = e => {
        // Make name field uppercase
        const field = e.target;
        const upperCase = field.value.toUpperCase();
        field.value = upperCase;
    }

    handleForm = e => {
        // Don't actually submit the bish
        e.preventDefault();

        const { name } = e.target;
        
        // Make sure a name has been entered
        if (name.value.trim() === '') {
            this.setState({
                errorMessage: 'Please enter a name',
                alertShown: true,
            });
            return;
        }

        // Send the name to the socket server
        const { socket } = this.props;
        socket.emit('joinSocketRoom', false, name.value.trim(), socket.id);
    }

    render() {
        const { alertShown, errorMessage } = this.state;
        const { disconnected } = this.props;

        return <div className='Join'>
            <div className='container'>
                <BackButton />
                <Title />
                {disconnected
                    ? <Disconnected />
                    : <>
                        <h2>Join the game!</h2>
                        <form onSubmit={e => this.handleForm(e)}>
                            <InputGroup
                                type='text'
                                name='name'
                                large={true}
                                placeholder='Name'
                                leftIcon='new-person'
                                maxLength='12'
                                onChange={e => this.makeUppercase(e)}
                            />
                            <Button
                                className='bp3-fill bp3-large bp3-intent-primary'
                                text='Join'
                                type='submit'
                            />
                        </form>
                    </>
                }
                <Alert
                    isOpen={alertShown}
                    onClose={() => this.setState({ alertShown: false, errorMessage: null }, () => this.form.name.focus())}
                    canEscapeKeyCancel={true}
                    canOutsideClickCancel={true}
                    icon='error'
                >
                    <Text>{errorMessage}</Text>
                </Alert>
            </div>
        </div>;
    }
}

export default withRouter(Join);
