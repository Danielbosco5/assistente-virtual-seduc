
export enum MessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system', // For initial messages or system notifications
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  image?: string; // base64 string for display
  sources?: WebSource[];
  timestamp: Date;
}

// Used for constructing new messages before they get an ID and timestamp
export interface NewMessagePayload {
  text: string;
  sender: MessageSender;
  image?: string;
}
