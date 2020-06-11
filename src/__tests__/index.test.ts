import { ioc } from "../index";

describe('ioc', () => {
  it('will throw if there are circular dependencies present', () => {
    const serviceA = (_: { someParam: any }) => 4;
    const serviceB = (_: { someParam: any }) => 4;
    const serviceC = (_: { someParam: number }) => 4;

    interface PublicServices {
      a: ReturnType<typeof serviceA>;
      b: ReturnType<typeof serviceB>;
      c: ReturnType<typeof serviceC>;
    }

    const container = ioc<PublicServices>();

    expect(() => {
      container.resolve({
        a: container.define(serviceA, { someParam: 'b' }),
        b: container.define(serviceB, { someParam: 'c' }),
        c: container.define(serviceB, { someParam: 'a' }),
      });
    }).toThrow('There are circular dependencies in your service definitions:\n* b -> a -> c -> b');
  });

  it('creates the services if configured correctly', () => {
    interface Clock {
      now(): Date;
    }

    interface Logger {
      log(msg: string): void;
    }

    const logger = (_: { clock: Clock }): Logger => ({
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
    const result = container.resolve({
      clock: container.define(clock, {}),
      logger: container.define(logger, { clock: 'clock' }),
    });

    expect(result).toHaveProperty('logger');
    expect(result.logger).toHaveProperty('log');
    expect(result).toHaveProperty('clock');
    expect(result.clock).toHaveProperty('now');
  });

  it('creates with no services', () => {
    const container = ioc<{}>();
    const result = container.resolve({});

    expect(result).toEqual({});
  });
});
