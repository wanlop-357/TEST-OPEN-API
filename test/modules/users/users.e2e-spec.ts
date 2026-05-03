import { Test, TestingModule } from '@nestjs/testing';
import { createUserDtoFixture } from '../../fixtures/users.fixture';
import { UsersController } from '../../../src/modules/users/users.controller';
import { UsersModule } from '../../../src/modules/users/users.module';

describe('UsersModule (e2e)', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('creates and reads user through module providers', async () => {
    const createdUser = await controller.create(createUserDtoFixture());
    const foundUser = controller.findOne(createdUser.id);

    expect(foundUser).toEqual(createdUser);
  });
});
