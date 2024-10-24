import * as core from '@actions/core';
import { run } from '../main';

let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;

jest.mock('eta', () => {
  return {
    ...jest.requireActual('eta'),
    Eta: jest.fn(() => ({
      renderString: jest.fn(() => {
        throw new Error('test error');
      })
    }))
  };
});

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();
  });

  describe('critical failure', () => {
    it('should fail', async () => {
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return 'this is a template';
          case 'variables':
            return 'a=b';
          default:
            return '';
        }
      });

      await run();

      expect(setFailedMock).toHaveBeenCalledWith('test error');
      expect(setOutputMock).not.toHaveBeenCalled();
    });
  });
});
