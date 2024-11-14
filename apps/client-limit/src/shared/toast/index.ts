import { useToast } from '@/shared/ui/toast'

type Toast = {
    title: string,
    description: string,
    variant: 'default' | 'destructive',
    duration: number
}

export function showToast (props: Toast) {
    const { toast } = useToast()

    toast({
        title: props.title,
        description: props.description,
        variant: props.variant,
        duration: props.duration
    })
}