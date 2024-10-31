<script  setup lang="ts">
import { useTRPC } from '@/shared/composables/use-trpc';
import { useQuery } from '@tanstack/vue-query';

const trpc = useTRPC();

function getUser() {
  return useQuery({
    queryFn: () => trpc.user.getUsers.query(),
    queryKey: ['users'],
  })
}

const { data, isLoading, status } = getUser();



</script>

<template>
  <div class="text-2xl bg-red-500 p-4">
   {{data}}
  </div>
</template>
