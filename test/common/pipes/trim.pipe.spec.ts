import { TrimPipe } from '../../../src/common/pipes/trim.pipe';

describe('TrimPipe', () => {
  const pipe = new TrimPipe();

  it('trims nested string values', () => {
    expect(
      pipe.transform({
        name: ' Alice ',
        tags: [' web ', ' app '],
        profile: {
          city: ' Bangkok ',
        },
      }),
    ).toEqual({
      name: 'Alice',
      tags: ['web', 'app'],
      profile: {
        city: 'Bangkok',
      },
    });
  });
});
