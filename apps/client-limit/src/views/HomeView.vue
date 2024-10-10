<script  setup lang="ts">
import { useTRPC } from '@/trpc-client';
import { useQuery } from '@tanstack/vue-query';

function getUser() {
  const trpc = useTRPC();

  return useQuery({
    queryFn: () => trpc.user.getUsers.query(),
    queryKey: ['users'],
  })
}

const data = getUser();
</script>

<template>
  <div class="text-2xl bg-red-1000 p-4">
    {{ data }}
  </div>
</template>
