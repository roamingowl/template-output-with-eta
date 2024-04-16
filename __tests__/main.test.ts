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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let warnMock: jest.SpiedFunction<typeof core.error>;
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    debugMock = jest.spyOn(core, 'debug').mockImplementation();
    errorMock = jest.spyOn(core, 'error').mockImplementation();
    warnMock = jest.spyOn(core, 'warning').mockImplementation();
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation();
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation();
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation();
  });

  describe('fail to parse variables', () => {
    it('should end with error message if variables are not valid JSON, YAML or dotenv', async () => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return 'this is a template';
          case 'variables':
            return 'jibberish';
          default:
            return '';
        }
      });

      await main.run();

      expect(errorMock).toHaveBeenCalledWith('Unable ot parse variables as JSON or YAML');
      expect(setFailedMock).not.toHaveBeenCalled();
    });
  });

  const TEMPLATE = 'Hi, <%= it.name %>! You are <%= it.age %> years old.';

  describe('render template with variables', () => {
    it('YAML variables', async () => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return TEMPLATE;
          case 'variables':
            return `name: Josh
                    age: 30`;
          case 'var_name':
            return 'it';
          default:
            return '';
        }
      });

      await main.run();

      expect(setOutputMock).toHaveBeenNthCalledWith(
        1,
        'text',
        expect.stringMatching('Hi, Josh! You are 30 years old.')
      );
      expect(errorMock).not.toHaveBeenCalled();
    });

    it('JSON variables', async () => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return TEMPLATE;
          case 'variables':
            return `{"name": "John", 
            "age": 25}`;
          default:
            return '';
        }
      });

      await main.run();

      expect(setOutputMock).toHaveBeenNthCalledWith(
        1,
        'text',
        expect.stringMatching('Hi, John! You are 25 years old.')
      );
      expect(errorMock).not.toHaveBeenCalled();
    });

    it('dotenv variables', async () => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return TEMPLATE;
          case 'variables':
            return `name=Joe
            age=30`;
          default:
            return '';
        }
      });

      await main.run();

      expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('Hi, Joe! You are 30 years old.'));
      expect(errorMock).not.toHaveBeenCalled();
    });
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

  it("if template from doesnt exist, don't fail", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'template':
          return './dummy_file.eta';
        case 'variables':
          return '{"name": "John"}';
        default:
          return '';
      }
    });

    await main.run();

    expect(setOutputMock).toHaveBeenCalledWith('text', './dummy_file.eta');
    expect(errorMock).not.toHaveBeenCalled();
  });

  describe('render using date-fns from utils', () => {
    it('should render formatted date', async () => {
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return 'Formatted date is <%= utils.dateFns.format(new UTCDateMini(it.timestamp * 1000), "MM/dd/yyyy HH:mm:ss") %>';
          case 'variables':
            return 'timestamp=1711187861';
          default:
            return '';
        }
      });

      await main.run();

      expect(setOutputMock).toHaveBeenNthCalledWith(
        1,
        'text',
        expect.stringMatching('Formatted date is 03/23/2024 09:57:41')
      );
      expect(errorMock).not.toHaveBeenCalled();
    });

    it('should render difference between two timestamps in minutes', async () => {
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return 'The difference is <%= Math.abs(utils.dateFns.differenceInMinutes(new Date(it.t1 * 1000), new Date(it.t2 * 1000))) %> minutes';
          case 'variables':
            return `t1=1711187861
            t2=1711188041`;
          default:
            return '';
        }
      });

      await main.run();

      expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('The difference is 3 minutes'));
      expect(errorMock).not.toHaveBeenCalled();
    });
  });
});
