import validate from 'validate.js';
import { difference, flatten, isArray, isEmpty, isObject, isString, uniq } from 'lodash';

import { CredentialsObject, ProjectDefaults, ProviderChoice, StagesNormalizedAttributes, VaultConfiguration } from '@stackmate/types';
import { PROVIDER, SERVICE_TYPE, STORAGE } from '@stackmate/constants';

/**
 * Validates the project's stages
 *
 * @param {Object} stages The stages configuration
 * @returns {String|undefined} The validation error message (if any)
 */
const validateStages = (stages: StagesNormalizedAttributes) => {
  if (isEmpty(stages) || !isObject(stages)) {
    return 'You have to provide a set of stages for the project, in the form of an object';
  }

  const stageErrors: Array<string> = [];

  Object.keys(stages).forEach(stageName => {
    const stage = stages[stageName];

    if (isEmpty(stage)) {
      return stageErrors.push(
        `Stage “${stageName}” does not contain any services`,
      );
    }

    if (Object.values(stage).some(s => !isObject(s))) {
      return stageErrors.push(
        `Stage “${stageName}” contains invalid service configurations. Every service should be declared as an object`,
      );
    }

    const serviceNames = Object.keys(stage);
    serviceNames.forEach(serviceName => {
      const srv = stage[serviceName];

      if (!Boolean(srv.type) || !Object.values(SERVICE_TYPE).includes(srv.type)) {
        stageErrors.push(
          `Stage “${stageName}” contains invalid configuration for service “${serviceName}”`,
        );
      }
    });
  });

  // Make sure the services are properly linked together
  const invalidLinks: Array<[string, Array<string>]> = [];
  Object.keys(stages).forEach(stageName => {
    const serviceNames = Object.keys(stages[stageName]);
    const links = uniq(
      flatten(Object.values(stages[stageName]).map(srv => srv.links || [])),
    );

    const invalidServices = difference(links, serviceNames);
    if (!isEmpty(invalidServices)) {
      stageErrors.push(
        `Stage ${stageName} has invalid links to “${invalidLinks.join('”, “')}”`
      );
    }
  });

  if (!isEmpty(stageErrors)) {
    return stageErrors;
  }
};

/**
 * Validates the project's defaults in the configuration file
 *
 * @param {ProjectDefaults} defaults the project's defaults
 * @returns {String|undefined} the error message (if any)
 */
const validateProjectDefaults = (defaults: ProjectDefaults) => {
  // Allow defaults not being defined or empty objects
  if (!defaults || (isObject(defaults) && isEmpty(defaults))) {
    return;
  }

  const providers = Object.values(PROVIDER);
  const hasValidProviderKeys = isObject(defaults) && Object.keys(defaults).some(
    prov => !providers.includes(prov as ProviderChoice),
  );

  if (!hasValidProviderKeys) {
    return 'The "defaults" entry should contain valid cloud providers in the mapping';
  }
};

/**
 * Validates the project's vault configuration
 *
 * @param {VaultConfiguration} vault The vault configuration
 * @returns {String|undefined} the error message (if any)
 */
const validateVault = (vault: VaultConfiguration) => {
  if (vault || !isObject(vault) || isEmpty(vault)) {
    return 'The project does not contain a “vault” section';
  }

  const { storage } = vault;
  if (!storage || !Object.values(STORAGE).includes(storage)) {
    return 'You have to specify a valid storage for your credentials vault';
  }

  if (storage === STORAGE.AWS_PARAMS) {
    const { key, region } = vault;

    if (!key || !region) {
      return 'The vault needs to have “region” and a “key” ARN to encrypt values';
    }
  }
};

/**
 * Validates the service links in the configuration
 *
 * @param {Array<String>} links the list of links to other services
 * @returns {String|undefined} the error message (if any)
 */
const validateServiceLinks = (links: Array<string>) => {
  if (isArray(links) && !links.every(l => isString(l))) {
    return 'The service contains an invalid entries under “links“';
  }
};

/**
 * Validates credentials
 *
 * @param {Credentials} credentials the credentials to validate
 * @param {Object} options
 * @param {Boolean} options.requireUserName whether the username is required
 * @param {Boolean} options.requirePassword whether the password is required
 * @returns {String|undefined} the error message (if any)
 */
const validateCredentials = (
  credentials: CredentialsObject, { requireUserName = true, requirePassword = true } = {},
) => {
  const { username, password } = credentials;
  const erroredFields = [];

  if (requireUserName && (!username || !isString(username))) {
    erroredFields.push('username');
  }

  if (requirePassword && (!password || !isString(password))) {
    erroredFields.push('password');
  }

  if (!isEmpty(erroredFields)) {
    const n = erroredFields.length;
    return `The “${erroredFields.join('” and “')}” ${n !== 1 ? 'fields are' : 'field is'} invalid`;
  }
};

Object.assign(validate.validators, {
  validateStages,
  validateProjectDefaults,
  validateVault,
  validateServiceLinks,
  validateCredentials,
});

export {
  validateStages,
  validateCredentials,
  validateProjectDefaults,
  validateVault,
  validateServiceLinks,
  validate,
};