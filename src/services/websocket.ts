import { Client, StompSubscription } from "@stomp/stompjs";
import { WS_BASE_URL } from "../constants/config";
import {
  getAuthToken,
  getSelectedHospitalId,
} from "../storage/AuthStorage";

const SELECTED_HOSPITAL_HEADER = "X-Hospital-Id";

let stompClient: Client | null = null;
let connectedHospitalId: string | null = null;
let connectionPromise: Promise<Client> | null = null;

const activeSubscriptions = new Map<string, StompSubscription>();

const normalizeHospitalId = (
  value: string | null,
): string | null => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

export const getStompClient = async (): Promise<Client> => {
  const token = await getAuthToken();

  const selectedHospitalId = normalizeHospitalId(
    await getSelectedHospitalId(),
  );

  if (stompClient?.active) {
    if (connectedHospitalId === selectedHospitalId) {
      if (stompClient.connected) {
        return stompClient;
      }

      if (connectionPromise) {
        return connectionPromise;
      }
    }

    disconnectWebSocket();
  }

  const connectHeaders: Record<string, string> = {};

  if (token) {
    connectHeaders.Authorization = `Bearer ${token}`;
  }

  if (selectedHospitalId) {
    connectHeaders[SELECTED_HOSPITAL_HEADER] = selectedHospitalId;
  }

  const client = new Client({
    brokerURL: WS_BASE_URL,
    connectHeaders,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient = client;
  connectedHospitalId = selectedHospitalId;

  connectionPromise = new Promise<Client>((resolve, reject) => {
    client.onConnect = () => {
      connectionPromise = null;
      resolve(client);
    };

    client.onStompError = (frame) => {
      connectionPromise = null;

      reject(
        new Error(
          frame.headers["message"] ||
            "WebSocket broker returned an error.",
        ),
      );
    };

    client.onWebSocketError = () => {
      connectionPromise = null;
      reject(
        new Error(
          "Unable to establish WebSocket connection.",
        ),
      );
    };
  });

  client.activate();

  return connectionPromise;
};

export const subscribeTopic = async (
  topic: string,
  callback: (message: unknown) => void,
): Promise<StompSubscription> => {
  const normalizedTopic = topic.trim();

  if (!normalizedTopic) {
    throw new Error("WebSocket topic is required");
  }

  unsubscribeTopic(normalizedTopic);

  const client = await getStompClient();

  if (!client.connected) {
    throw new Error(
      "WebSocket connection is not established.",
    );
  }

  const subscription = client.subscribe(
    normalizedTopic,
    (message) => {
      try {
        callback(JSON.parse(message.body));
      } catch {
        callback(message.body);
      }
    },
  );

  activeSubscriptions.set(
    normalizedTopic,
    subscription,
  );

  return subscription;
};

export const subscribeQueueTopic = async (
  hospitalId: string,
  callback: (event: any) => void,
): Promise<StompSubscription> => {
  const normalized = hospitalId?.trim();
  if (!normalized) {
    throw new Error("Hospital ID is required for queue subscription");
  }
  const topic = `/topic/hospital/${normalized}/queue`;
  return subscribeTopic(topic, callback);
};

export const unsubscribeQueueTopic = (hospitalId: string): void => {
  const normalized = hospitalId?.trim();
  if (normalized) {
    unsubscribeTopic(`/topic/hospital/${normalized}/queue`);
  }
};

export const unsubscribeTopic = (
  topic: string,
): void => {
  const normalizedTopic = topic.trim();

  if (!normalizedTopic) {
    return;
  }

  const subscription =
    activeSubscriptions.get(normalizedTopic);

  if (!subscription) {
    return;
  }

  try {
    subscription.unsubscribe();
  } catch (error) {
    console.warn(
      `Error unsubscribing from WebSocket topic ${normalizedTopic}:`,
      error,
    );
  } finally {
    activeSubscriptions.delete(normalizedTopic);
  }
};

export const disconnectWebSocket = (): void => {
  activeSubscriptions.forEach(
    (subscription, topic) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn(
          `Error unsubscribing from WebSocket topic ${topic}:`,
          error,
        );
      }
    },
  );

  activeSubscriptions.clear();

  connectedHospitalId = null;
  connectionPromise = null;

  if (!stompClient) {
    return;
  }

  const client = stompClient;
  stompClient = null;

  try {
    void client.deactivate();
  } catch (error) {
    console.warn(
      "Error deactivating STOMP client:",
      error,
    );
  }
};
