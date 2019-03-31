import * as original from 'numeral';

// Override zero/null formatting.
original.nullFormat('0');
original.zeroFormat('0');

export const numeral = original;
