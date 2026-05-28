import { createConsumer, Consumer } from "@rails/actioncable";

function getCableUrl(): string {
  if (process.env.NEXT_PUBLIC_CABLE_URL) return process.env.NEXT_PUBLIC_CABLE_URL;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${window.location.host}/cable`;
}

let consumer: Consumer | null = null;

export function getConsumer(): Consumer {
  if (!consumer) {
    consumer = createConsumer(getCableUrl());
  }
  return consumer;
}
