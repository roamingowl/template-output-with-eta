import * as core from '@actions/core';
import { Eta } from 'eta';
import YAML from 'yaml';
import dotenv from 'dotenv';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const template = core.getInput('template', { required: true });
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
        console.debug('Variables parsed as JSON');
      } catch {
        // If the JSON parse fails, try to parse as YAML
      }

      if (typeof parsedVariables !== 'object') {
        try {
          parsedVariables = YAML.parse(variables);
          console.debug('Variables parsed as YAML');
        } catch {
          // If the YAML parse fails, try parse detoenv
        }
      }

      if (typeof parsedVariables !== 'object') {
        try {
          parsedVariables = dotenv.parse(Buffer.from(variables, 'utf8'));
          console.debug('Variables parsed as dotenv');
        } catch {
          // If the dotenv parse fails, log an error
        }
      }

      if (typeof parsedVariables !== 'object') {
        console.log('Unable ot parse variables as JSON or YAML');
      }

      console.log('variables', parsedVariables);
    }
    const eta = new Eta({ varName });
    const renderedTemplate = eta.renderString(template, { ...parsedVariables });

    core.setOutput('text', renderedTemplate);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
