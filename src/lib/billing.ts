import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from './api'
import { useApiQuery } from './hooks'
import { queryKeys } from './queryKeys'
import type {
  AdminBillingTransaction,
  BillingSummary,
  BillingTransaction,
  CheckoutResult,
  GatewayId,
  MyPlacement,
  PlanId,
  ReputationSummary,
} from './types'

export function useMyBilling(enabled = true) {
  return useApiQuery(queryKeys.billing, () => api.get<BillingSummary>('/me/billing'), { enabled })
}

export function useMyTransactions(enabled = true) {
  return useApiQuery(queryKeys.myTransactions, () => api.get<BillingTransaction[]>('/me/transactions'), { enabled })
}

export function useMyReputation(enabled = true) {
  return useApiQuery(queryKeys.myReputation, () => api.get<ReputationSummary>('/me/reputation'), { enabled })
}

export function useMyPlacements(enabled = true) {
  return useApiQuery(queryKeys.myPlacements, () => api.get<MyPlacement[]>('/me/placements'), { enabled })
}

export function useAdminTransactions() {
  return useApiQuery(queryKeys.adminTransactions, () => api.get<AdminBillingTransaction[]>('/admin/billing/transactions'))
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation<CheckoutResult, ApiError, { plan: PlanId; serverId?: string; gateway: GatewayId; periodDays?: number }>({
    mutationFn: (vars) =>
      api.post<CheckoutResult>('/billing/checkout', {
        plan: vars.plan,
        serverId: vars.serverId,
        gateway: vars.gateway,
        periodDays: vars.periodDays,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.billing }),
  })
}

export function useAdminSetTxStatus() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean }, ApiError, { id: string; action: 'mark-paid' | 'mark-failed' | 'refund' | 'cancel' }>({
    mutationFn: ({ id, action }) => api.post<{ success: boolean }>(`/admin/billing/transactions/${id}/${action}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminTransactions })
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing })
    },
  })
}

export function useAdminBillingSweep() {
  const queryClient = useQueryClient()
  return useMutation<{ expired: number }, ApiError>({
    mutationFn: () => api.post<{ expired: number }>('/admin/billing/sweep'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminTransactions })
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing })
    },
  })
}

export function formatMoney(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : `${currency} `
  return `${symbol}${amount.toFixed(2)}`
}
