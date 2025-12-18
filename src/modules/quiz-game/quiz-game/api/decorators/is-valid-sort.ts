import {
  registerDecorator,
  ValidationArguments,
  ValidatorOptions,
} from 'class-validator';

type EnumLike = Record<string, string | number>;

export function IsValidSort<
  TSortBy extends EnumLike,
  TDirection extends EnumLike,
>(
  sortByEnum: TSortBy,
  directionEnum: TDirection,
  validationOptions?: ValidatorOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidSort',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [sortByEnum, directionEnum],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (!Array.isArray(value)) {
            return false;
          }

          const [sortByEnum, directionEnum] = args.constraints as [
            TSortBy,
            TDirection,
          ];

          return value.every((item) => {
            if (typeof item !== 'string') {
              return false;
            }

            const [field, direction] = item.split(' ');

            if (!field || !direction) {
              return false;
            }

            const validField = Object.values(sortByEnum).includes(field);
            const validDirection = Object.values(directionEnum).includes(
              direction.toUpperCase(),
            );

            return validField && validDirection;
          });
        },

        defaultMessage(args: ValidationArguments) {
          return `Некорректный формат sort. Ожидается: "<field> <ASC|DESC>"`;
        },
      },
    });
  };
}
