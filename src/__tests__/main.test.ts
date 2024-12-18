import * as core from '@actions/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { MockInstance } from 'vitest';
import { run } from '../main';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let debugMock: MockInstance<typeof core.debug>;
let errorMock: MockInstance<typeof core.error>;
let warnMock: MockInstance<typeof core.warning>;
let getInputMock: MockInstance<typeof core.getInput>;
let setFailedMock: MockInstance<typeof core.setFailed>;
let setOutputMock: MockInstance<typeof core.setOutput>;

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    debugMock = vi.spyOn(core, 'debug').mockImplementation(vi.fn());
    errorMock = vi.spyOn(core, 'error').mockImplementation(vi.fn());
    warnMock = vi.spyOn(core, 'warning').mockImplementation(vi.fn());
    getInputMock = vi.spyOn(core, 'getInput').mockImplementation(vi.fn());
    setFailedMock = vi.spyOn(core, 'setFailed').mockImplementation(vi.fn());
    setOutputMock = vi.spyOn(core, 'setOutput').mockImplementation(vi.fn());
  });

  describe('fail to parse variables', () => {
    it('should end with error message if variables are not valid JSON, YAML or dotenv', async () => {
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

      await run();

      expect(errorMock).toHaveBeenCalledWith('Unable ot parse variables as JSON or YAML');
      expect(setFailedMock).not.toHaveBeenCalled();
    });
  });

  const TEMPLATE = 'Hi, <%= it.name %>! You are <%= it.age %> years old.';

  describe('render template without variables', () => {
    it('should render template without variables', async () => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation(name => {
        switch (name) {
          case 'template':
            return 'Hello sunshine!';
          default:
            return '';
        }
      });

      await run();

      expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('Hello sunshine!'));
      expect(errorMock).not.toHaveBeenCalled();
      expect(warnMock).toHaveBeenCalled();
    });
  });

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

      await run();

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

      await run();

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

      await run();

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

    await run();

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

    await run();

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

      await run();

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

      await run();

      expect(setOutputMock).toHaveBeenNthCalledWith(1, 'text', expect.stringMatching('The difference is 3 minutes'));
      expect(errorMock).not.toHaveBeenCalled();
    });
  });
});
