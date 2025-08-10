// "use client"

// import { useEffect, useState, useCallback, useRef } from "react"
// import { useToast } from "@/components/ui/use-toast"

// interface RealtimeEvent {
//   type: string
//   data: any
//   timestamp: string
// }

// interface UseRealtimeOptions {
//   url?: string
//   reconnectInterval?: number
//   maxReconnectAttempts?: number
//   onConnect?: () => void
//   onDisconnect?: () => void
//   onError?: (error: Event) => void
// }

// export function useRealtime(options: UseRealtimeOptions = {}) {
//   const {
//     url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
//     reconnectInterval = 3000,
//     maxReconnectAttempts = 5,
//     onConnect,
//     onDisconnect,
//     onError,
//   } = options

//   const [isConnected, setIsConnected] = useState(false)
//   const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
//     "disconnected",
//   )
//   const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
//   const [eventHistory, setEventHistory] = useState<RealtimeEvent[]>([])

//   const wsRef = useRef<WebSocket | null>(null)
//   const reconnectAttemptsRef = useRef(0)
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
//   const eventListenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

//   const { toast } = useToast()

//   const connect = useCallback(() => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       return
//     }

//     setConnectionStatus("connecting")

//     try {
//       wsRef.current = new WebSocket(url)

//       wsRef.current.onopen = () => {
//         setIsConnected(true)
//         setConnectionStatus("connected")
//         reconnectAttemptsRef.current = 0
//         onConnect?.()

//         toast({
//           title: "Connected",
//           description: "Real-time updates are now active",
//           duration: 2000,
//         })
//       }

//       wsRef.current.onmessage = (event) => {
//         try {
//           const parsedEvent: RealtimeEvent = JSON.parse(event.data)
//           setLastEvent(parsedEvent)
//           setEventHistory((prev) => [...prev.slice(-99), parsedEvent]) // Keep last 100 events

//           // Notify listeners
//           const listeners = eventListenersRef.current.get(parsedEvent.type)
//           if (listeners) {
//             listeners.forEach((callback) => callback(parsedEvent.data))
//           }

//           // Notify wildcard listeners
//           const wildcardListeners = eventListenersRef.current.get("*")
//           if (wildcardListeners) {
//             wildcardListeners.forEach((callback) => callback(parsedEvent))
//           }
//         } catch (error) {
//           console.error("Failed to parse WebSocket message:", error)
//         }
//       }

//       wsRef.current.onclose = () => {
//         setIsConnected(false)
//         setConnectionStatus("disconnected")
//         onDisconnect?.()

//         // Attempt to reconnect
//         if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//           reconnectAttemptsRef.current++
//           reconnectTimeoutRef.current = setTimeout(() => {
//             connect()
//           }, reconnectInterval)
//         } else {
//           toast({
//             title: "Connection Lost",
//             description: "Unable to reconnect to real-time updates",
//             variant: "destructive",
//           })
//         }
//       }

//       wsRef.current.onerror = (error) => {
//         setConnectionStatus("error")
//         onError?.(error)
//         console.error("WebSocket error:", error)
//       }
//     } catch (error) {
//       setConnectionStatus("error")
//       console.error("Failed to create WebSocket connection:", error)
//     }
//   }, [url, reconnectInterval, maxReconnectAttempts, onConnect, onDisconnect, onError, toast])

//   const disconnect = useCallback(() => {
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current)
//     }

//     if (wsRef.current) {
//       wsRef.current.close()
//       wsRef.current = null
//     }

//     setIsConnected(false)
//     setConnectionStatus("disconnected")
//   }, [])

//   const send = useCallback((type: string, data: any) => {
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//       wsRef.current.send(JSON.stringify({ type, data, timestamp: new Date().toISOString() }))
//       return true
//     }
//     return false
//   }, [])

//   const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
//     if (!eventListenersRef.current.has(eventType)) {
//       eventListenersRef.current.set(eventType, new Set())
//     }
//     eventListenersRef.current.get(eventType)!.add(callback)

//     // Return unsubscribe function
//     return () => {
//       const listeners = eventListenersRef.current.get(eventType)
//       if (listeners) {
//         listeners.delete(callback)
//         if (listeners.size === 0) {
//           eventListenersRef.current.delete(eventType)
//         }
//       }
//     }
//   }, [])

//   useEffect(() => {
//     connect()

//     return () => {
//       disconnect()
//     }
//   }, [connect, disconnect])

//   return {
//     isConnected,
//     connectionStatus,
//     lastEvent,
//     eventHistory,
//     connect,
//     disconnect,
//     send,
//     subscribe,
//   }
// }
