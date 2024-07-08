import * as core from '@actions/core';
import { Eta } from 'eta';
import * as fs from 'fs';
import * as dateFns from 'date-fns';
import { UTCDateMini } from '@date-fns/utc';
import { parseVariables } from './variables';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    let template = core.getInput('template', { required: true });
    const varName = core.getInput('var_name', { required: false }) || 'it';
    const rawVariables = core.getInput('variables', {
      required: false
    });

    core.debug(`Template string: ${template}`);
    core.debug(`Variables prefix in template: ${varName}`);

    const parsedVariables = parseVariables(rawVariables);

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
