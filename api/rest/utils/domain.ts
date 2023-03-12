import * as R from 'ramda';
import ThrowError from '../../../errors/basic';

export const isRequiredField = (obj: any, validate: any) => {
  let errors = {};
  Object.keys(validate).forEach((key) => {
    if (!R.path([key], obj) || R.isEmpty(R.path([key], obj))) {
      errors = {
        ...errors,
        [key]: `field is required`,
      };
    }
  });

  if (!R.isEmpty(errors)) throw ThrowError.FIELD_IS_REQUIRED(errors);
  return true;
};
