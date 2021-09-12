import { CloudManager, CloudStack, CloudService } from 'interfaces';
import { CloudPrerequisites, ConstructorOf, ProviderChoice, RegionList, ServiceAttributes, ServiceList, ServiceMapping, ServiceTypeChoice } from 'types';

abstract class Cloud implements CloudManager {
  abstract readonly provider: ProviderChoice;

  abstract readonly regions: RegionList;

  abstract readonly serviceMapping: ServiceMapping;

  protected abstract prerequisites: CloudPrerequisites;

  readonly stack: CloudStack;

  readonly defaults: object; // todo

  /**
   * @var {Map} _services the services registry
   */
  private _services: ServiceList = new Map();

  /**
   * @var {String} _region the provider's region
   * @private
   */
  private _region: string;

  abstract init(): void;

  constructor(region: string, stack: CloudStack, defaults = {}) { // todo: defaults
    this.stack = stack;
    this.defaults = defaults;
    this.region = region;
    this.init();
  }

  /**
   * @returns {String} the region for the cloud provider
   */
  public get region(): string {
    return this._region;
  }

  /**
   * @param {String} region the region for the cloud provider
   */
  public set region(region: string) {
    if (!region || !Object.values(this.regions)) {
      throw new Error(`Invalid region ${region} for provider ${this.provider}`);
    }

    this._region = region;
  }

  /**
   * Returns the service class given a specific type
   *
   * @param {String} type the type of service class to provide
   * @returns {CloudService} the class for the service to instantiate
   */
  protected getServiceClass(type: ServiceTypeChoice): ConstructorOf<CloudService> {
    if (!type) {
      throw new Error('Invalid type specified');
    }

    const serviceClass = this.serviceMapping.get(type);

    if (!serviceClass) {
      throw new Error(`Service ${type} for ${this.provider} is not supported, yet`);
    }

    return serviceClass;
  }

  /**
   * Registers a service in the cloud services registry
   *
   * @param {ServiceTypeChoice} type the type of the service to register
   * @param {ServiceAttributes} attributes the service's attributes
   * @returns {CloudService} the service that just got registered
   */
  register(type: ServiceTypeChoice, attributes: ServiceAttributes): CloudService {
    const ServiceClass = this.getServiceClass(type);

    const service = new ServiceClass(this.stack, attributes);
    service.dependencies = this.prerequisites;
    service.validate();

    this._services.set(service.name, service);

    return service;
  }

  /**
   * Prepares the cloud provider for an operation
   */
  prepare() {
    // Main service provisions
    this._services.forEach(service => service.provision());

    // Process the services associations, after all service provisions are in place
    // this._services.forEach(service => service.link(this._services));
  }
}

export default Cloud;
