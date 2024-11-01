import { useTRPC } from "@/shared/composables/use-trpc";
import { useMutation } from "@tanstack/vue-query";
import { registerSchemaType } from "z-limit";
import { useRouter } from 'vue-router'

export function useRegister() {
    const trpc = useTRPC(); 
    const router = useRouter();
    
    return useMutation({
        mutationKey: ['register'],
        mutationFn: (props: registerSchemaType) => trpc.auth.register.mutate(props)
    })
}   