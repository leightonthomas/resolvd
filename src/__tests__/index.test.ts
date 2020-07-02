import { ioc } from "../index";

describe('ioc', () => {
  it('will throw if there are circular dependencies present', async () => {
    const serviceA = (_: { someParam: any }) => 4;
    const serviceB = (_: { someParam: any }) => 4;
    const serviceC = (_: { someParam: number }) => 4;

    interface PublicServices {
      a: ReturnType<typeof serviceA>;
      b: ReturnType<typeof serviceB>;
      c: ReturnType<typeof serviceC>;
    }

    const container = ioc<PublicServices>();

    await expect(
      async () => container.resolve({
        a: container.define(serviceA, { someParam: 'b' }),
        b: container.define(serviceB, { someParam: 'c' }),
        c: container.define(serviceB, { someParam: 'a' }),
      })
    ).rejects.toThrow('There are circular dependencies in your service definitions:\n* b -> a -> c -> b');
  });

  it('creates the services if configured correctly', async () => {
    const logger = async (_: { clock: Clock }): Promise<Logger> => ({
      log() {},
    });

    const clock = () => ({
      now: () => new Date,
    });

    interface PublicServices {
      logger: Logger;
      clock: Clock;
    }

    const container = ioc<PublicServices>();
    const result = await container.resolve({
      clock: container.define(clock, {}),
      logger: container.define(logger, { clock: 'clock' }),
    });

    expect(result).toHaveProperty('logger');
    expect(result.logger).toHaveProperty('log');
    expect(result).toHaveProperty('clock');
    expect(result.clock).toHaveProperty('now');
  });

  it('will provide new instances of services when they are configured to do so', async () => {
    const incrementer = jest.fn();

    interface PublicServices {
      incrementer: () => void;
      myService1: () => void;
      myService2: () => void;
    }

    const container = ioc<PublicServices>();
    const result = await container.resolve({
      incrementer: container.define(incrementer, {}, { alwaysNewInstance: true }),
      myService1: container.define((_: { i: () => void }) => () => {}, { i: 'incrementer' }),
      myService2: container.define(async (_: { i: () => void }) => () => {}, { i: 'incrementer' })
    });

    expect(result).toHaveProperty('incrementer');
    expect(result).toHaveProperty('myService1');
    expect(result).toHaveProperty('myService2');

    // once for each dependency, and once for the overall service
    expect(incrementer).toHaveBeenCalledTimes(3);
  });

  const sameServiceOptions: [string, Parameters<ReturnType<typeof ioc>['define']>[2]][] = [
    ['explicitly false', { alwaysNewInstance: false }],
    ['default value of false', { }],
  ];

  it.each(sameServiceOptions)(
    'will provide the same instance of a services when they are configured to do so (%s)',
    async (_, options) => {
      const incrementer = jest.fn();

      interface PublicServices {
        incrementer: () => void;
        myService1: () => void;
        myService2: () => void;
      }

      const container = ioc<PublicServices>();
      const result = await container.resolve({
        incrementer: container.define(incrementer, {}, options),
        myService1: container.define(async (_: { i: () => void }) => () => {}, { i: 'incrementer' }),
        myService2: container.define((_: { i: () => void }) => () => {}, { i: 'incrementer' })
      });

      expect(result).toHaveProperty('incrementer');
      expect(result).toHaveProperty('myService1');
      expect(result).toHaveProperty('myService2');

      expect(incrementer).toHaveBeenCalledTimes(1);
    },
  );

  it('creates with no services', async () => {
    const container = ioc<{}>();
    const result = await container.resolve({});

    expect(result).toEqual({});
  });
});

interface Clock {
  now(): Date;
}

interface Logger {
  log(msg: string): void;
}
