import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () => {
  return Transform(({ value }: TransformFnParams): any => {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value.map((v) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return typeof v === 'string' ? v.trim() : v;
      });
    }

    return value;
  });
};
