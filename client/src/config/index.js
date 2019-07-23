import { DEV_BASE_URL } from './dev.conf'
import { PROD_BASE_URL } from './prod.conf'

let BASE_URL = ''

if (process.env.NODE_ENV === 'development') {
  BASE_URL = DEV_BASE_URL
} else {
  BASE_URL = PROD_BASE_URL
}
export {
  BASE_URL
} 