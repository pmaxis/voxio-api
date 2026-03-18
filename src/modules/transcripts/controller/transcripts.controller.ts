import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TranscriptsService } from '@/modules/transcripts/service/transcripts.service';
import { CreateTranscriptDto } from '@/modules/transcripts/dto/create-transcript.dto';
import { UpdateTranscriptDto } from '@/modules/transcripts/dto/update-transcript.dto';

@Controller('transcripts')
export class TranscriptsController {
  constructor(private readonly transcriptsService: TranscriptsService) {}

  @Post()
  create(@Body() createTranscriptDto: CreateTranscriptDto) {
    return this.transcriptsService.create(createTranscriptDto);
  }

  @Get()
  findAll() {
    return this.transcriptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transcriptsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranscriptDto: UpdateTranscriptDto) {
    return this.transcriptsService.update(id, updateTranscriptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transcriptsService.remove(id);
  }
}
