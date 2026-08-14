import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { api, ApiError } from '../lib/api'
import { queryKeys } from './queryKeys'

export function useApiQuery<T>(
  key: QueryKey,
  fn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, ApiError, T, QueryKey>, 'queryKey' | 'queryFn'>
): UseQueryResult<T, ApiError> {
  return useQuery<T, ApiError>({ queryKey: key, queryFn: fn, ...options })
}

/** Mutation that invalidates server/cacheRevision-backed queries on success. */
export function useApiMutation<TData, TVariables = void>(
  options: UseMutationOptions<TData, ApiError, TVariables> & { invalidate?: QueryKey[] } = {}
) {
  const queryClient = useQueryClient()
  const { invalidate = [queryKeys.servers], onSuccess, ...rest } = options
  return useMutation<TData, ApiError, TVariables>({
    ...rest,
    onSuccess: (data, variables, onMutateResult, context) => {
      for (const key of invalidate) void queryClient.invalidateQueries({ queryKey: key })
      onSuccess?.(data, variables, onMutateResult, context)
    },
  })
}

export function errorMessage(error: ApiError): string {
  if (Array.isArray(error.body.message)) return error.body.message.join('. ')
  return error.message
}

export { api }
