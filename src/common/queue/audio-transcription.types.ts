export interface AudioTranscriptionPayload {
  jobId: string;
  chatId: string | number;
  inputFileId: string;
  clientId: string;
  durationSeconds: number;
}

export const AUDIO_QUEUE_CLIENT = Symbol('AUDIO_QUEUE_CLIENT');

export interface AudioQueueClient {
  addToAudioQueue(payload: AudioTranscriptionPayload): Promise<unknown>;
}
