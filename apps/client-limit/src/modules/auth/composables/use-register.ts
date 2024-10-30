import { useTRPC } from "@/trpc-client";
import { useMutation } from "@tanstack/vue-query";
import { registerSchemaType, loginSchemaType } from "z-limit";

export function useRegister() {
    const trpc = useTRPC(); 

    return useMutation({
        mutationKey: ['register'],
        mutationFn: (props: registerSchemaType) => trpc.auth.register.mutate(props)
    })
}

export function useLogin() {
    const trpc = useTRPC(); 

    return useMutation({
        mutationKey: ['login'],
        mutationFn: (props: loginSchemaType) => trpc.auth.login.mutate(props)
    })
}       