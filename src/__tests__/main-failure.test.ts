import * as core from '@actions/core';
import type { MockInstance } from 'vitest';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { run } from '../main.ts';

// let getInputMock: MockInstance<typeof core.getInput>;
let setFailedMock: MockInstance<typeof core.setFailed>;
let setOutputMock: MockInstance<typeof core.setOutput>;

vi.mock('eta', async () => {

  return {
    Eta: class {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      renderString(template: string, data?: unknown): string {
        throw new Error('test error');
      }
    }
  }

  // return {
  //   ...originalModule,
    // Eta: vi.fn(() => ({
    //   renderString: vi.fn(() => {
    //     throw new Error('test error');
    //   })
    // }))
    // renderString: vi.fn(() => {
    //   throw new Error('test error');
    // })
  // }
})
// vi.mock('eta', async importOriginal => {
//   return {
//     ...(await importOriginal<typeof import('eta')>()),
//     Eta: vi.fn(() => ({
//       renderString: vi.fn(() => {
//         throw new Error('test error');
//       })
//     }))
//   };
// });

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // getInputMock = vi.spyOn(core, 'getInput').mockImplementation(vi.fn());
    setFailedMock = vi.spyOn(core, 'setFailed').mockImplementation(vi.fn());
    setOutputMock = vi.spyOn(core, 'setOutput').mockImplementation(vi.fn());
  });

  describe('critical failure', () => {
    it('should fail', async () => {
      vi.spyOn(core, 'getInput').mockImplementation(name => {
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
