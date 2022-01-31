import fs from 'fs';
import crypto from 'crypto';
import { Address4 } from 'ip-address';
import { isObject } from 'lodash';
import { BaseEntity } from '@stackmate/interfaces';

/**
 * Returns an MD5 hash of an object
 *
 * @param {Object} obj the object to create a hash from
 * @returns {String} the md5 hash
 */
export const hashObject = (obj: object): string => (
  crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex').toString()
);

/**
 * Creates a directory if it doesn't exist
 *
 * @param {String} path the path to create (if doesn't exist)
 * @void
 */
export const createDirectory = (path: string): void => {
  const exists = fs.existsSync(path);

  if (exists && !fs.statSync(path).isDirectory()) {
    throw new Error(`Path ${path} already exists and it's not a directory`);
  }

  fs.mkdirSync(path, { recursive: true, mode: 0o700 });
};

/**
 * Returns whether the given object is a subset of another object
 *
 * @param {Object} subObj the subset object
 * @param {Object} superObj the superset object
 * @returns {Boolean}
 */
export const isKeySubset = (subObj: any, superObj: any): boolean => (
  Object.keys(subObj).every((key) => {
    if (isObject(subObj[key])) {
      return isKeySubset(superObj[key], subObj[key]);
    }

    return key in subObj && key in superObj;
  })
);

/**
 * Returns a list of CIDR blocks based on a single IP
 *
 * @param {String} ip the IP address to base the CIDR blocks from
 * @param {Number} bitmask the bit mask to use
 * @param {Number} subnets the number of subnets to launch
 * @param {Number} subnetBitmask the bitmask to use for the subnets
 * @returns {Array<string>} the list of CIDR blocks
 */
export const getNetworkingCidrBlocks = (
  ip: string, bitmask: number = 16, subnets: number = 2, subnetBitmask: number = 24,
): Array<string> => {
  const cidrBlocks: Array<string> = [];
  const root = new Address4(`${ip}/${bitmask}`);
  cidrBlocks.push(
    `${root.startAddress().address}/${bitmask}`,
  );

  const [firstOctet, secondOctet] = root.toArray();
  Array.from(Array(subnets).keys()).map((num) => {
    const subnetIp = [firstOctet, secondOctet, String(num + 1), String(0)].join('.')
    cidrBlocks.push(`${subnetIp}/${subnetBitmask}`);
  });

  return cidrBlocks;
};

export const getSubclassesOf = (root: BaseEntity) => {
};
