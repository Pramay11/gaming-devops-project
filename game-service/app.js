const WebSocket = require('ws');
const Redis = require('ioredis');
const amqp = require('amqplib');

const redis = new Redis(process.env.REDIS_HOST);

const wss = new WebSocket.Server({ port: 4000 });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    console.log('Received:', message);

    // Cache player state
    await redis.set('player', message);

    // Send to queue
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue('game_events');
    ch.sendToQueue('game_events', Buffer.from(message));

    ws.send('Processed');
  });
});

console.log('Game service running');