import type { ServiceResult } from '@lib/client'

// types that are only used in the web client
export interface RealtimeServiceResult extends ServiceResult {
  arrivalTime?: string
  arrivalDelay?: number
  departureTime?: string
  departureDelay?: number
  hasDeparted?: boolean
  isRealtime: boolean
}
