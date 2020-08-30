import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
      controllers: [AppController]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('Get Hello Message"', () => {
      expect(appController.getHello()).toMatch(/XLoJ Judge Server, from "*"./);
    });
  });
});
