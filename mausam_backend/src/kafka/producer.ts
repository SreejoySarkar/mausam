import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'mausam-backend',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

export const publishWeatherAlert = async (alertData: any) => {
  await producer.connect();
  await producer.send({
    topic: 'severe-weather-alerts',
    messages: [
      { value: JSON.stringify(alertData) },
    ],
  });
  await producer.disconnect();
};