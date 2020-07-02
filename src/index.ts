import { Edge, topologicalKahn } from "./sort/topologicalKahn";
import { cycleAnalyser } from "./cycleAnalyser";

export interface Container<Public extends object, Private extends object> {
  /**
   * Resolve the definitions into an object containing only the public services
   *
   * @param defs - The service definitions
   */
  resolve: (defs: DepResolver<Public & Private>) => Promise<Public>;

  /**
   * Define a service for use with `resolve`
   */
  define: ServiceDefiner<Public & Private>;
}

export const ioc = <Public extends object, Private extends object = {}>(): Container<Public, Private> => ({
  resolve: (defs: DepResolver<Public & Private>) => resolveDependencies<Public, Private>(defs),
  define: registerService<Public & Private>(),
});

const IocTag: unique symbol = Symbol('fnIocConstructed');

// we can be flexible with the typing here as it's going to be more specific on the actual definition
interface ServiceDefinition<OverallServices, ExpectedType> {
  readonly _tag: typeof IocTag;
  service: (arg: { [key: string]: unknown }) => Promise<ExpectedType>|ExpectedType;
  options: ServiceOptions;
  dependencies: {
    [key: string]: keyof OverallServices;
  };
}

type DepResolver<OverallServices extends object> = {
  [key in keyof OverallServices]: ServiceDefinition<OverallServices, OverallServices[key]>;
}

type ServiceParams<D extends Record<string, keyof OverallServices>, OverallServices> = {
  [key in keyof D]: D[key] extends keyof OverallServices ? OverallServices[D[key]] : unknown
};

interface ServiceOptions {
  /**
   * Whether or not to provide a new instance to every usage of this dependency.
   */
  alwaysNewInstance: boolean;
}

type ServiceDefiner<OverallServices extends object> = <D extends Record<string, keyof OverallServices>, R>(
  service: (arg: ServiceParams<D, OverallServices>) => Promise<R>|R,
  deps: D,
  options?: Partial<ServiceOptions>,
) => ServiceDefinition<OverallServices, R>;

const registerService = <OverallServices extends object>(): ServiceDefiner<OverallServices> => (service, deps, options) => ({
  service: service as (arg: { [key: string]: unknown }) => ReturnType<typeof service>,
  dependencies: deps,
  _tag: IocTag,
  options: Object.assign(
    { alwaysNewInstance: false },
    options || {},
  ),
});

const resolveDependencies = async <Public extends object, Private extends object>(
  defs: DepResolver<Public & Private>
): Promise<Public> => {
  type OverallServices = Public & Private;

  // Figure out what order we should create things in
  const constructionOrder = topologicalKahn(
    new Set(Object.keys(defs).map(v => v.toString())),
    new Set(
      // Convert all service definitions to graph edges
      Object.entries<ServiceDefinition<OverallServices, unknown>>(defs).reduce(
        (carry, rootDefPair) => {
          Object.entries(rootDefPair[1].dependencies).map(depPair => {
            // from the dependency, to the root
            carry.push({
              from: depPair[1].toString(),
              to: rootDefPair[0].toString(),
            });
          });

          return carry;
        },
        [] as Edge<string>[],
      ),
    ),
    (a, b) => a === b,
  );

  if (constructionOrder.type === 'left') {
    const cycles = cycleAnalyser(constructionOrder.value, 1000);

    if (cycles.type === 'left') {
      throw new Error(
        `There are circular dependencies present, but could not resolve them explicitly because: ${cycles.value}`,
      );
    }

    if (cycles.value.length > 0) {
      throw new Error(
        `There are circular dependencies in your service definitions:\n${cycles.value.map(p => `* ${p}`).join('\n')}`
      );
    } else {
      throw new Error("There was an unknown error while analysing the present circular dependencies.");
    }
  }

  const serviceFactories = new Map<keyof OverallServices, () => Promise<unknown>>();
  const constructedServices = {} as OverallServices;

  for(const nextConstruction of constructionOrder.value) {
    const definition = defs[nextConstruction as keyof OverallServices];

    const createServiceInstance = async () => {
      const dependencies: { [key: string]: unknown } = {};

      for (const nextDepDefinition of Object.entries(definition.dependencies)) {
        const nextDepKey = nextDepDefinition[1];

        if (serviceFactories.has(nextDepKey)) {
          dependencies[nextDepDefinition[0]] = await serviceFactories.get(nextDepKey)!();
        } else {
          dependencies[nextDepDefinition[0]] = constructedServices[nextDepKey];
        }
      }

      return await definition.service(dependencies);
    };

    if (definition.options.alwaysNewInstance) {
      serviceFactories.set(nextConstruction as keyof OverallServices, createServiceInstance);
    }

    constructedServices[nextConstruction as keyof OverallServices] = (
      await createServiceInstance()
    ) as OverallServices[keyof OverallServices];
  }

  return constructedServices;
};

