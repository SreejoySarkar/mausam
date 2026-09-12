import { Kafka } from 'kafkajs';

const { messaging } = require('../firebaseAdmin');

const kafka = new Kafka({
  clientId: 'mausam-worker',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
  groupId: 'fcm-push-group'
});

export const startAlertWorker = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: 'severe-weather-alerts',
    fromBeginning: false
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const alert = JSON.parse(message.value.toString());

      const fcmMessage = {
        notification: {
          title: alert.title,
          body: alert.description
        },
        topic: alert.targetProfile
      };

      try {
        const response = await messaging.send(fcmMessage);
        console.log('Successfully sent message:', response);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
};