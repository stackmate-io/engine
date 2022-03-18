import { TerraformProvider } from 'cdktf';

import { PROVIDER, SERVICE_TYPE } from '@stackmate/engine/constants';

import { AttributeParsers, BaseEntity, Validations } from './entity';
import { CloudStack, CredentialsObject } from './lib';
import { VaultCredentialOptions } from './project';
import { OneOf, ChoiceOf, AbstractConstructorOf } from './util';

export type ProviderChoice = ChoiceOf<typeof PROVIDER>;
export type ServiceTypeChoice = ChoiceOf<typeof SERVICE_TYPE>;
export type ServiceScopeChoice = OneOf<['deployable', 'preparable', 'destroyable']>;
export type ServiceAssociationDeclarations = string[];

export type RegionList = {
  [name: string]: string;
};

export type ServiceAssociation = {
  lookup: (a: CloudService) => boolean;
  handler: (a: CloudService) => void;
};

export type ServiceConfigurationDeclaration = {
  type: ServiceTypeChoice;
  provider?: ProviderChoice;
  region?: string;
  profile?: string;
  links?: ServiceAssociationDeclarations;
};

export type ServiceConfigurationDeclarationNormalized = {
  type: ServiceTypeChoice;
  provider: ProviderChoice;
  region: string;
  name: string;
  projectName: string;
  stageName: string;
  profile?: string;
  links?: ServiceAssociationDeclarations;
};

// The final attributes that the Service class should expect
export type ServiceAttributes = ServiceConfigurationDeclarationNormalized;

export type ServiceList = Map<string, CloudService>;

export interface CloudService extends BaseEntity {
  readonly name: string;
  readonly provider: ProviderChoice;
  readonly type: ServiceTypeChoice;
  region: string;
  links: Array<string>;
  identifier: string;
  providerService: ProviderService;
  vault: VaultService;
  get isRegistered(): boolean;
  link(...targets: CloudService[]): CloudService;
  associations(): ServiceAssociation[];
  isDependingUpon(service: CloudService): boolean;
  parsers(): AttributeParsers & Required<{ name: Function, links: Function }>;
  validations(): Validations & Required<{ name: object, links: object }>;
  register(stack: CloudStack): void;
  scope(name: ServiceScopeChoice): CloudService;
  onPrepare(stack: CloudStack): void;
  onDeploy(stack: CloudStack): void;
  onDestroy(stack: CloudStack): void;
}

export interface Sizeable extends BaseEntity {
  size: string;
  parsers(): AttributeParsers & Required<{ size: Function }>;
  validations(): Validations & Required<{ size: object }>;
}

export interface Storable extends BaseEntity {
  storage: number;
  parsers(): AttributeParsers & Required<{ size: Function }>;
  validations(): Validations & Required<{ storage: object }>;
}

export interface MultiNode extends BaseEntity {
  nodes: number;
  parsers(): AttributeParsers & Required<{ nodes: Function }>;
  validations(): Validations & Required<{ nodes: object }>;
}

export interface Versioned extends BaseEntity {
  version: string;
  parsers(): AttributeParsers & Required<{ version: Function }>;
  validations(): Validations & Required<{ version: object }>;
}

export interface Profilable extends BaseEntity {
  profile: string;
  overrides: object;
}

export interface VaultService extends CloudService {
  credentials(stack: CloudStack, service: string, opts?: VaultCredentialOptions): CredentialsObject;
}

export interface ProviderService extends CloudService {
  resource: TerraformProvider;
  bootstrap(stack: CloudStack): void;
  prerequisites(stack: CloudStack): void;
}

export interface StateService extends CloudService {
  backend(stack: CloudStack): void;
  resources(stack: CloudStack): void;
}


export interface CloudServiceConstructor extends AbstractConstructorOf<CloudService> { }
