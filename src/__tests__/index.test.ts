import * as main from '../main';

const runMock = jest.spyOn(main, 'run').mockImplementation();

describe('index', () => {
  it('calls run when imported', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../index');
    expect(runMock).toHaveBeenCalled();
  });
});
