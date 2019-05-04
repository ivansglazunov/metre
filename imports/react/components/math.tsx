import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import * as math from 'mathjs';

export const mathEval = (formula, scope) => {
  let result;
  try {
    result = math.eval(formula, scope);
  } catch(error) {
    result = NaN;
  }
  if (!result) result = NaN;

  return {
    value: String(result),
    number: typeof(result) === 'number'
    ? result
    : typeof(result) === 'object' && result.mathjs
    ? result.value
    : 0,
    result,
  };
};

export const MathEval = ({ formula, scope, children }: { formula: string, scope: any, children: any }) => {
  const result = mathEval(formula, scope);

  if (typeof(children) === 'function') return children(result);

  return children;
};
