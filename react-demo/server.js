'use strict';

// Messaging configuration
const amqp = require('amqplib');
const messaging_host = 'messaging';
const messaging_user = process.env.MSG_USER;
const messaging_pass = process.env.MSG_PASS;
const queue = 'requests';
const messaging_url = `amqp://${messaging_user}:${messaging_pass}@${messaging_host}`;
// use one connection for all AMPQ things
var messaging_conn = amqp.connect(messaging_url);

// Express / ws configuration
const express = require('express');
const ws = require('ws');
const app = express();

// serve static files from the current dir
app.use(express.static(__dirname))

// Set up a WebSocket server that proxies our messages
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', function(socket) {
    console.log("WebSocket connection established");
    messaging_conn.then(function(conn) {
        console.log("Building AMQP channel");
        conn.createChannel().then(function(ch) {
            console.log("Creating AMPQ response queue");
            ch.assertQueue('', { exclusive: true }).then(function(ok) {
                console.log("Creating callback for AMPQ response messages");
                ch.consume(ok.queue, function(response) {
                    var resp = response.content.toString();
                    console.log(`Received ${resp} from AMQP response queue`);
                    console.log(`Sending ${resp} to WebSocket`);
                    socket.send(resp);
                }, { noAck: true });
                return ok;
            }).then(function(ok) {
                console.log("Creating a callback for WebSocket messages");
                socket.on('message', function(message) {
                    console.log(`Recieved ${message} from WebSocket`);
                    console.log(`Sending ${message} to AMPQ ${queue} queue`);
                    ch.sendToQueue(queue, Buffer.from(message), { replyTo: ok.queue });
                });
            });
        });
    });
});

const server = app.listen(8080);

// since we are sharing a server we pass off upgrade requests to ws
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

console.log("Serving static files and listening for WebSocket connections...");
