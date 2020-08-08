import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as basicAuth from 'basic-auth';

import { JudgeService } from './judge.service';
import { JudgeSubmissionDTO } from './types';
import { isUndef } from '../utils';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway()
export class JudgeGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private configService: ConfigService,
    private judgeService: JudgeService
  ) {}

  afterInit(server: Server): any {
    server.sockets.on('connection', (client: Socket) => {
      const auth = basicAuth.parse(
        client.handshake.query.authorization ||
          client.handshake.headers.authorization
      ) as { name: string; pass: string } | undefined;
      if (
        isUndef(auth) ||
        auth.name !== this.configService.get<string>('USERNAME') ||
        auth.pass !== this.configService.get<string>('PASSWORD')
      ) {
        client.disconnect();
      }
    });
  }

  @SubscribeMessage('judge')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: errors => new WsException(errors)
    })
  )
  judge(@MessageBody() body: JudgeSubmissionDTO) {
    return this.judgeService
      .judge(body)
      .map(data => ({ event: 'judge', data }));
  }
}
