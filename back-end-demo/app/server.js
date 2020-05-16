#!/usr/bin/env node

var hostname = 'messaging';
var user = process.env.RABBITMQ_USER
var pass = process.env.RABBITMQ_PASS

var messaging_url = `amqp://${user}:${pass}@${hostname}`;
var amqp = require('amqplib/callback_api');

amqp.connect(messaging_url, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'requests';

    channel.assertQueue(queue, {
      durable: false
    });
    channel.prefetch(1);
    console.log('Listening for requests...');
    channel.consume(queue, function reply(msg) {
      console.log(`Received: ${msg.content}`);
      var json = JSON.parse(msg.content);
      var action = json['action'];
      var response = "Unknown action"; // default if nothing is matched
      switch(action) {
        case 'ECHO':
          data = json['data'];
          console.log(`Echoing ${data}`);
          response = data;
          break;
      }

      channel.sendToQueue(msg.properties.replyTo, Buffer.from(response), {
        correlationId: msg.properties.correlationId
      });
      channel.ack(msg);
    });
  });
});
