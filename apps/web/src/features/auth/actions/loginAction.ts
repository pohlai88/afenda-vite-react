import { login, type LoginInput } from '../services/authService'

export async function loginAction(input: LoginInput) {
  await login(input)
}
