import development from './development';
import production from './production';

let config;

if (process.env.NODE_ENV !== 'production') {
  config = development;
} else {
  config = production;
}

export default config;
