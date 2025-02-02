import { DependencyList, useCallback, useRef } from 'react'

type CallbackType = (type: 'primary' | 'secondary') => void

export default function useLongPress(
    callback: CallbackType,
    ms: number = 200
): [() => void, () => void, () => void] {
    const timerRef = useRef<number | null>(null)

    const endTimer = () => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    const onStartLongPress = useCallback(() => {
        endTimer()
        timerRef.current = window.setTimeout(() => {
            endTimer()
            callback('secondary')
        }, ms)
    }, [callback, ms])

    const onEndLongPress = useCallback(() => {
        if (timerRef.current !== null) {
            endTimer()
            callback('primary')
        }
    }, [callback])

    return [onStartLongPress, onEndLongPress, endTimer]
}
