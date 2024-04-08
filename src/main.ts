import * as core from '@actions/core';
import { Eta } from 'eta';
import YAML from 'yaml';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as dateFns from 'date-fns';
import { UTCDateMini } from '@date-fns/utc';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    let template = core.getInput('template', { required: true });
    const varName = core.getInput('var_name', { required: false }) || 'it';
    const variables = core.getInput('variables', {
      required: false
    });

    core.debug(`Template string: ${template}`);
    core.debug(`Variables prefix in template: ${varName}`);

    let parsedVariables: { [key: string]: unknown } | undefined;

    if (variables.length > 0) {
      try {
        parsedVariables = JSON.parse(variables);
        core.debug('Variables parsed as JSON');
      } catch {
        // If the JSON parse fails, try to parse as YAML
      }

      if (typeof parsedVariables !== 'object') {
        try {
          parsedVariables = YAML.parse(variables);
          core.debug('Variables parsed as YAML');
        } catch {
          // If the YAML parse fails, try parse detoenv
        }
      }

      if (typeof parsedVariables !== 'object') {
        parsedVariables = dotenv.parse(Buffer.from(variables, 'utf8'));
        if (typeof parsedVariables === 'object' && Object.keys(parsedVariables).length === 0) {
          core.debug('No variables found by dotenv');
          parsedVariables = undefined;
        }
      }

      if (typeof parsedVariables !== 'object') {
        core.error('Unable ot parse variables as JSON or YAML');
      }
    }
    const eta = new Eta({
      varName,
      functionHeader: 'const utils = it._utilsInternal; const UTCDateMini = utils.UTCDateMini;'
    });

    if (fs.existsSync(template)) {
      template = fs.readFileSync(template, 'utf8');
    }

    const templateVariables = {
      ...parsedVariables,
      _utilsInternal: { dateFns, UTCDateMini }
    };

    const renderedTemplate = eta.renderString(template, templateVariables);

    core.setOutput('text', renderedTemplate);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}
