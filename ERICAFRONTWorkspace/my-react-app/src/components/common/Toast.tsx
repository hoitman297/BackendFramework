import { useState, useCallback, useRef } from 'react'
import './Toast.css'

type ToastType = 'success' | 'error' | 'info'

interface ToastState {
  visible: boolean
  message: string
  type: ToastType
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ visible: true, message, type })
    timerRef.current = setTimeout(() => setToast(s => ({ ...s, visible: false })), 3000)
  }, [])

  return { toast, showToast }
}

interface ToastProps {
  visible: boolean
  message: string
  type: ToastType
}

export default function Toast({ visible, message, type }: ToastProps) {
  if (!visible) return null
  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  )
}
