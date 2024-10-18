import { useTRPC } from "@/trpc-client";
import { useMutation } from "@tanstack/vue-query";
import { registerSchema } from "packages/z/auth";
import { z } from "zod";

export type useRegisterProps = z.infer<typeof registerSchema>
export function useRegister() {
    const trpc = useTRPC(); 

    return useMutation({
        mutationKey: ['register'],
        mutationFn: (props: useRegisterProps) => trpc.auth.register.mutate(props)
    })
}