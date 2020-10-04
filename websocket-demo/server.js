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

// Express configuration
const express = require('express');
const app = express();
const port = 8080;
// serve static files from the current dir
app.use(express.static(__dirname))
const server = app.listen(port);

// ws configuration
const ws = require('ws');
const wsServer = new ws.Server({ noServer: true });

// since we are sharing a server we pass off upgrade requests to ws
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});

// Set up a WebSocket AMPQ proxy
wsServer.on('connection', function(socket) {
    console.log("WebSocket connection established");
    messaging_conn.then(function(conn) {
        console.log("Building AMQP channel");
        conn.createChannel().then(function(ch) {
            console.log("Creating AMPQ response queue");
            ch.assertQueue('', { exclusive: true }).then(function(ok) {
                console.log("Creating callback for AMPQ response messages");
                ch.consume(ok.queue, function(response) {
                    console.log(`AMQP ${ok.queue} -> WebSocket`);
                    socket.send(response.content.toString());
                }, { noAck: true });
                return ok;
            }).then(function(ok) {
                console.log("Creating a callback for WebSocket messages");
                socket.on('message', function(message) {
                    console.log(`WebSocket -> AMQP ${queue}`);
                    ch.sendToQueue(queue, Buffer.from(message),
                        { replyTo: ok.queue });
                });
            });
        });
    });
});

console.log("Serving static files and listening for WebSocket connections...");
