import { createConsumer, Consumer } from "@rails/actioncable";

const CABLE_URL = process.env.NEXT_PUBLIC_CABLE_URL ?? "ws://localhost:3001/cable";

let consumer: Consumer | null = null;

export function getConsumer(): Consumer {
  if (!consumer) {
    consumer = createConsumer(CABLE_URL);
  }
  return consumer;
}
