import { vi, describe, it, expect } from 'vitest';
import * as main from '../main';

const runMock = vi.spyOn(main, 'run').mockImplementation(vi.fn());

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../index');
    expect(runMock).toHaveBeenCalled();
  });
});
