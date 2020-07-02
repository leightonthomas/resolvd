# resolvd
Simple, small, and type-safe inversion of control/dependency injection for JavaScript & TypeScript with zero dependencies

## Upgrading from 1.x -> 2.x
Version 2 is fully promise based, but the only change that's necessary is `await`ing the result of `ioc().resolve`:

```typescript
import { ioc } from 'resolvd';

const container = ioc();

// throws:
// There are circular dependencies in your service definitions:
// * b -> a -> c -> b
await container.resolve({ /** ...service definitions */ });
```

## Circular dependencies
resolvd will identify circular dependencies and throw an error message containing the offending services:

```typescript
import { ioc } from 'resolvd';

// A requires B, which requires C, which requires A, which requires B, etc.
const serviceA = (_: { serviceB: unknown }) => {};
const serviceB = (_: { serviceC: unknown }) => {};
const serviceC = (_: { serviceA: unknown }) => {};

interface Services {
  a: ReturnType<typeof serviceA>,
  b: ReturnType<typeof serviceB>,
  c: ReturnType<typeof serviceC>,
}

const container = ioc<Services>();

// throws:
// There are circular dependencies in your service definitions:
// * b -> a -> c -> b
container.resolve({
  a: container.define(serviceA, { serviceB: 'b' }),
  b: container.define(serviceB, { serviceC: 'c' }),
  c: container.define(serviceC, { serviceA: 'a' }),
});
```

### Type-safe
Trying to define a dependency of the wrong type will cause an TypeScript error - stopping the issue at compile time

## Usage
```typescript
import { ioc } from 'resolvd';

interface ILogger {
  log(msg: string): void;
}

interface IClock {
  now(): Date;
}

interface PublicServices {
  logger: ILogger;
  someObject: object;
}

interface PrivateServices {
  clock: IClock;
}

const somePreConstructedObject = {
  foo: 'bar',
};

const consoleLogger = async (deps: { someParamName: IClock }): Promise<ILogger> => ({
  log(msg) {
    console.log(`[${deps.someParamName.now().toISOString()}] ${msg}`);
  },
});

const clock = (): IClock => ({
  now: () => new Date,
});

// create a new container with the specified services available
const container = ioc<PublicServices, PrivateServices>();
// resolve the service definitions into an object of type `PublicServices`
const services = await container.resolve({
  // use `container.define` to define each service definition
  logger: container.define(consoleLogger, { someParamName: 'clock' }),
  clock: container.define(clock, {}),
  // always provide a new instance of this service to whatever is requesting it
  someObject: container.define(_ => somePreConstructedObject, { alwaysNewInstance: true }),
});

// the PublicServices are now available!
services.logger.log('hello, world!'); // [2020-06-10T19:26:34.000Z] hello, world!
```

**Services should only be registered using `ioc().define(...)`!**
