import os from 'os';
import path from 'path';
import { RegionList } from '@stackmate/types';
import { AWS_REGIONS } from '@stackmate/clouds/aws/constants';

export const DEFAULT_PROJECT_FILE = path.join(process.cwd(), '.stackmate', 'config.yml');
export const OUTPUT_DIRECTORY = process.env.STACKMATE_OUTPUT || path.join(os.tmpdir(), 'stackmate');
export const DEFAULT_STAGE = 'production';
export const DEFAULT_RESOURCE_COMMENT = 'Provisioned by Stackmate';

export const PROVIDER = {
  AWS: 'aws',
} as const;

export const SERVICE_TYPE = {
  CDN: 'cdn',
  DATABASE: 'database',
  INSTANCE: 'instance',
  REDIS: 'redis',
  MEMCACHED: 'memcached',
  MAILER: 'mailer',
  VOLUME: 'volume',
  SSL: 'ssl',
  DNS: 'dns',
  LOAD_BALANCER: 'loadbalancer',
  ELASTIC_STORAGE: 'elasticstorage',
  NETWORKING: 'networking',
} as const;

export const REGION: { [name: string]: RegionList } = {
  [PROVIDER.AWS]: AWS_REGIONS,
} as const;

export const FORMAT: { [name: string]: string } = {
  YML: 'yml',
  JSON: 'json',
  RAW: 'raw',
} as const;

export const STORAGE: { [name: string]: string } = {
  FILE: 'file',
  AWS_PARAMS: 'aws/ssm/parameter-store',
} as const;

export const ENVIRONMENT_VARIABLE = {
  AWS_ACCESS_KEY_ID: 'STACKMATE_AWS_ACCESS_KEY_ID',
  AWS_SECRET_ACCESS_KEY: 'STACKMATE_SECRET_ACCESS_KEY',
  AWS_SESSION_TOKEN: 'STACKMATE_AWS_SESSION_TOKEN',
};

// Service defaults

/**
 * @var {Number} DEFAULT_STORAGE the default storage to apply to services (in Gigabytes)
 */
export const DEFAULT_STORAGE = 30;
