import amqp from "amqplib";
import dotenv from "dotenv";
dotenv.config();

let channel: amqp.Channel;

const AMQP_URL = process.env.AMQP_URL;
if (!AMQP_URL) {
  throw new Error("AMQP_URL environment variable is not set");
}

export const connectQueue = async () => {
  console.log("Connecting to AMQP queue...");
  const conn = await amqp.connect(AMQP_URL);
  conn.on("error", (err) => {
    console.error("AMQP connection error:", err);
  });
  channel = await conn.createChannel();
  await channel.assertQueue("orders", { durable: true });
};

export const sendToQueue = async (data: object) => {
  if (!channel) throw new Error("Queue not connected");
  channel.sendToQueue("orders", Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};
