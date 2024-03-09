/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core';
import * as main from '../src/main';

// Mock the action's main function
// const runMock = jest.spyOn(main, 'run');

// Mock the GitHub Actions core library

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let debugMock: jest.SpiedFunction<typeof core.debug>;
let errorMock: jest.SpiedFunction<typeof core.error>;
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    debugMock = jest.spyOn(core, 'debug').mockImplementation();
    errorMock = jest.spyOn(core, 'error').mockImplementation();
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();
  });

  it('render template with YAML variables', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'template':
          return 'Hi, <%= it.name %>!';
        case 'variables':
          return 'name: "Josh"';
        case 'var_name':
          return 'it';
        default:
          return '';
      }
    });

    await main.run();

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('Hi, Josh!'));
    expect(errorMock).not.toHaveBeenCalled();
  });

  it('render template with JSON variables', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'template':
          return 'Hi, <%= it.name %>!';
        case 'variables':
          return '{"name": "John"}';
        default:
          return '';
      }
    });

    await main.run();

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('Hi, John!'));
    expect(errorMock).not.toHaveBeenCalled();
  });

  it('render template with dotenv variables', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'template':
          return 'Hi, <%= it.NAME %>!';
        case 'variables':
          return 'NAME=Joe';
        default:
          return '';
      }
    });

    await main.run();

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('Hi, Joe!'));
    expect(errorMock).not.toHaveBeenCalled();
  });

  it('render template from file', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'template':
          return './examples/simple.eta';
        case 'variables':
          return '{"name": "John"}';
        default:
          return '';
      }
    });

    await main.run();

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('Hi John!'));
    expect(errorMock).not.toHaveBeenCalled();
  });
});
