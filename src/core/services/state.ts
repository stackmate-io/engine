import Service from '@stackmate/engine/core/service';
import { SERVICE_TYPE } from '@stackmate/engine/constants';
import { Attribute } from '@stackmate/engine/lib/decorators';
import { CloudStack, StateService, ServiceTypeChoice } from '@stackmate/engine/types';

abstract class State extends Service implements StateService {
  /**
   * @var {String} name the service's name
   */
  @Attribute name: string = 'stage-state';

  /**
   * @var {ServiceTypeChoice} type the service's type
   */
  type: ServiceTypeChoice = SERVICE_TYPE.STATE;

  /**
   * Provisions the state storage itself
   *
   * @param {CloudStack} stack the stack to deploy the resource to
   */
  abstract resources(stack: CloudStack): void;

  /**
   * Provisions a data resources for the state
   *
   * @param {CloudStack} stack the stack to deploy the resources to
   */
  abstract backend(stack: CloudStack): void;

  /**
   * Provisioning when we initially prepare a stage
   *
   * @param {CloudStack} stack the stack to provision the service in
   * @void
   */
  onPrepare(stack: CloudStack): void {
    this.resources(stack);
  }

  /**
   * Provisioning when we deploy a stage
   *
   * @param {CloudStack} stack the stack to provision the service in
   * @void
   */
  onDeploy(stack: CloudStack): void {
    this.backend(stack);
  }

  /**
   * Provisioning on when we destroy destroy a stage
   *
   * @param {CloudStack} stack the stack to provision the service in
   * @void
   */
  onDestroy(stack: CloudStack): void {
    // The state has to be present when destroying resources
    this.backend(stack);
  }
}

export default State;
