import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpeechService {
  private readonly apiKey: string;
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('openai.apiKey') ?? '';

    this.openai = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  async transcribe(filePath: string): Promise<string> {
    const response = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'gpt-4o-transcribe',
    });

    return response.text;
  }

  async translateToUkrainian(text: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'user',
          content: `Переклади цей текст на українську: ${text}`,
        },
      ],
    });

    return response.choices[0].message.content ?? '';
  }

  async generateSpeech(text: string, format: 'mp3' | 'opus' = 'mp3'): Promise<Buffer> {
    const response = await this.openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
      response_format: format,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  }

  async process(
    filePath: string,
  ): Promise<{ original: string; translated: string; audio: Buffer }> {
    const englishText = await this.transcribe(filePath);
    const ukrainianText = await this.translateToUkrainian(englishText);
    const audioBuffer = await this.generateSpeech(ukrainianText, 'opus');

    return {
      original: englishText,
      translated: ukrainianText,
      audio: audioBuffer,
    };
  }
}
