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
        this.state = {action: '', data: ''};
        this.changeAction = this.changeAction.bind(this);
        this.changeData = this.changeData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    changeAction(event) {
        this.setState({action: event.target.value, data: this.state.data});
    }

    changeData(event) {
        this.setState({action: this.state.action, data: event.target.value});
    }

    handleSubmit(event) {
        this.props.socket.send(
            JSON.stringify({action: this.state.action, data: this.state.data}));
        this.setState({action: '', data: ''});
        event.preventDefault();
    }

    render() {
        return e("form", {onSubmit: this.handleSubmit},
                e("label", null, "Action:",
                    e("input", {type: "text", value: this.state.action,
                        onChange: this.changeAction})),
                e("label", null, "Data:",
                    e("input", {type: "text", value: this.state.data,
                        onChange: this.changeData})),
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
