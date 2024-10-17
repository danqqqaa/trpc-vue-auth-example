import { router, procedure } from "../../trpc/trpc";

export const authRouter = router({ 
    login: procedure.mutation(async (opts) => {
        console.log(opts);
        
    })
})  