import Service from '@stackmate/engine/core/service';
import { SERVICE_TYPE } from '@stackmate/engine/constants';
import { Attribute } from '@stackmate/engine/lib/decorators';
import {
  CloudStack, VaultService, CredentialsObject, ServiceTypeChoice, VaultCredentialOptions,
} from '@stackmate/engine/types';

abstract class Vault extends Service implements VaultService {
  /**
   * @var {String} name the name for the service
   */
  @Attribute name: string = 'stage-vault';

  /**
   * @var {String} type the type for the service
   */
  readonly type: ServiceTypeChoice = SERVICE_TYPE.VAULT;

  /**
   * @var {Boolean} registered whether the service is registered into the stack
   */
  private registered: boolean = false;

  /**
   * Provides credentials for a service
   *
   * @param {CloudStack} stack the stack to deploy the credentials upon
   * @param {String} service the service to provide credentials for
   * @param {Object} opts options to pass along the credentials generation
   * @param {Boolean} opts.root whether the credentials are root credentials
   * @param {Boolean} opts.special whether to allow special characters or not
   * @param {String[]} opts.exclude the list of special characters to exclude
   * @returns {Object} the username / password pair
   */
  abstract credentials(stack: CloudStack, service: string, opts: VaultCredentialOptions): CredentialsObject;

  /**
   * @returns {Boolean} whether the vault is registered in the stack
   */
  get isRegistered(): boolean {
    return this.registered;
  }

  onDeploy(stack: CloudStack): void {
    /* no-op - every change should be introduced through the username / password methods */
    this.registered = true;
  }
}

export default Vault;
