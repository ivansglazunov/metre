import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import * as math from 'mathjs';

export const MathEval = ({ formula, scope, children }: { formula: string, scope: any, children: any }) => {
  let result;
  try {
    result = math.eval(formula, scope);
  } catch(error) {
    result = NaN;
  }
  if (!result) result = NaN;

  if (typeof(children) === 'function') return children({
    value: String(result),
    number: typeof(result) === 'number'
    ? result
    : typeof(result) === 'object' && result.mathjs
    ? result.value
    : 0,
    result,
  })

  return children;
};
