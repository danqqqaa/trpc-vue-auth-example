import { showToast } from '../toast'
import { ZodObject, ZodRawShape } from 'zod'

export function validateSchema<T extends ZodRawShape>(
  schema: ZodObject<T>,
  props: unknown
): boolean {
  
  const result = schema.safeParse(props)

  if (!result.success) {
    const errors = result.error.issues
    for (const error of errors) {
      showToast({
        title: 'Ошибка регистрации',
        description: error.message,
        variant: 'destructive',
        duration: 3000
      })
    }
    return false
  }
  return true
}
