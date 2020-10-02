'use strict';

const e = React.createElement;

class Messages extends React.Component {
    messageEvent(event) {
        this.setState({messages: this.state.messages.concat(event.data)});
    }

    constructor(props) {
        super(props);
        this.state = {messages: []};
        props.socket.addEventListener('message', this.messageEvent.bind(this));
    }

    render() {
        return this.state.messages.map(
            (message) => e('div', null, `${message}`)
        )
    }
}

class Send extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.socket.send(this.state.value);
        this.setState({value: ''});
        event.preventDefault();
    }

    render() {
        return e("form", {onSubmit: this.handleSubmit},
                e("input", {type: "text", value: this.state.value,
                    onChange: this.handleChange}),
                e("input", {type: "submit", value: "Send"}));
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {socket: new WebSocket('ws://localhost:8080')}
    }

    render() {
        return [
            e(Messages, {socket: this.state.socket}),
            e(Send, {socket: this.state.socket})
        ]
    }
}

ReactDOM.render(e(App), document.getElementById('root'));
