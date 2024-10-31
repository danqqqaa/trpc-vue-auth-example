import { useToast } from '@/shared/ui/toast'
import { ZodObject, ZodRawShape } from 'zod'

export function ValidateSchemas<T extends ZodRawShape>(schema: ZodObject<T>, props: unknown) {
  const { toast } = useToast()

  const parse = schema.safeParse(props)
  if (!parse.success) {
    const err = parse.error.issues
    for (let _error of err) {
      toast({
        title: 'Ошибка авторизации',
        description: _error.message,
        variant: 'destructive',
        duration: 3000
      })
    }
    throw new Error('Данные не прошли валидацию')
  }
}
