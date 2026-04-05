export interface LoginInput {
  email: string
  password: string
}

export async function login(_input: LoginInput): Promise<void> {
  // Placeholder for backend auth integration.
}
