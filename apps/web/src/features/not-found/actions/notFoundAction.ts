import { notFoundMessage } from '../services/notFoundService'

export function logNotFoundAction(pathname: string) {
  return Promise.resolve({ pathname, message: notFoundMessage() })
}
