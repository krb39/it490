from flask import Flask, render_template, request
from werkzeug.security import check_password_hash, generate_password_hash
import pika
import os
import json
import logging
import time

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

class Messaging:
    """
    Helper class for dealing with the messaging service
    """
    request_queue_name = 'request'

    # Get credentials from the environment
    credentials = pika.PlainCredentials(os.environ['RABBITMQ_DEFAULT_USER'],
                                        os.environ['RABBITMQ_DEFAULT_PASS'])

    # docker-compose will resolve this host to our messaging service
    host = 'messaging'

    def __init__(self):
        """
        Establishes connection and creates queues as needed
        """
        logging.info("Messaging: Establishing connection")
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=self.host, credentials=self.credentials))
        self.channel = self.connection.channel()
        logging.info("Messaging: Creating queues")
        self.channel.queue_declare(queue=self.request_queue_name)
        self.result_queue = self.channel.queue_declare(queue='', exclusive=True).method.queue

    def __del__(self):
        """
        Closes down the connection
        """
        logging.info("Messaging: Closing down connection")
        self.connection.close()

    def send(self, action, data):
        """
        Sends an action and data to the request queue in JSON. Sets the
        reply_to property to the custom result queue.
        """
        logging.info(f"Messaging: send(action={action}, data={data})")

        self.channel.basic_publish(
            exchange='',
            routing_key=self.request_queue_name,
            properties=pika.BasicProperties(
                reply_to=self.result_queue),
                body=json.dumps({'action': action, 'data': data}
            )
        )

    def receive(self):
        """
        Waits for a single message and returns it. Waits up to 1s, checking
        every 0.1s.
        """
        attempts = 0
        while True:
            method_frame, properties, body = self.channel.basic_get(
                self.result_queue, auto_ack=True)
            if method_frame:
                received = json.loads(body)
                logging.info(f"Messaging: received={received}")
                return received
            elif attempts > 10:
                logging.info("Messaging: receive did not get message") 
                return None 
            else:
                time.sleep(0.1)
                attempts += 1

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        messaging = Messaging()
        messaging.send(
            'REGISTER',
            {
                'email': email,
                'hash': generate_password_hash(password)
            }
        )
        response = messaging.receive()
        if response['success']:
            return "Thanks for registering!"
        else:
            return f"{response['message']}"
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        messaging = Messaging()
        messaging.send('GETHASH', { 'email': email })
        response = messaging.receive()
        if response['success'] != True:
            return "Login failed."
        if check_password_hash(response['hash'], password):
            return "Login succeeded."
        else:
            return "Login failed."
    return render_template('login.html')
