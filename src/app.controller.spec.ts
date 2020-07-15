import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('Get Hello Message"', () => {
      expect(appController.getHello()).toBe('XLoJ Judge Server');
    });
  });
});
