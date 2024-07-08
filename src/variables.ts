import * as core from '@actions/core';
import YAML from 'yaml';
import dotenv from 'dotenv';

export function parseVariables(variables: string) {
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

  return parsedVariables;
}