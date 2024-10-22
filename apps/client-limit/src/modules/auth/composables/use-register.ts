import { useTRPC } from "@/trpc-client";
import { useMutation } from "@tanstack/vue-query";
import { registerSchemaType } from "z-limit";

export function useRegister() {
    const trpc = useTRPC(); 

    return useMutation({
        mutationKey: ['register'],
        mutationFn: (props: registerSchemaType) => trpc.auth.register.mutate(props)
    })
}