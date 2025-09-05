import Redis from 'ioredis'

export const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

export const subscriber = new Redis({ 
  host: "localhost",
  port: 6379
});

redis.on("connect", () => {
  console.log("Redis Connected Successfully");
});

subscriber.on("connect", () =>{
  console.log("Subscriber Connected Successfully");
})


export async function emitUserEvent(event: string, payload: any) {
  await redis.publish("user-events", JSON.stringify({ event, payload }));
};


export function listenUserEvents(handler: (event: string, payload: any) => void) {
  subscriber.subscribe("user-events");
  subscriber.on("message", (_, message) => {
    const { event, payload } = JSON.parse(message);
    handler(event, payload);
  });
};
