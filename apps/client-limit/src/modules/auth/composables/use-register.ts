import { useTRPC } from "@/shared/composables/use-trpc";
import { useMutation } from "@tanstack/vue-query";
import { registerSchemaType } from "z-limit";

export function useRegister() {
    const trpc = useTRPC(); 

    return useMutation({
        mutationKey: ['register'],
        mutationFn: (props: registerSchemaType) => trpc.auth.register.mutate(props)
    })
}   