import {useCallback, useRef} from 'react'

export default function useLongPress(
  callback,
  ms = 200
) {
  const timerRef = useRef(0)

  const endTimer = () => {
    clearTimeout(timerRef.current || 0)
    timerRef.current = 0
  }

  const onStartLongPress = useCallback(() => {
		endTimer()
    timerRef.current = window.setTimeout(() => {
			endTimer()
			callback('secondary')
    }, ms)
  }, [callback, ms])

  const onEndLongPress = useCallback(() => {
		if (timerRef.current) {
      endTimer()
      callback('primary')
    }/* else {
			callback(e, 'secondary')
		}*/
  }, [callback])

  return [onStartLongPress, onEndLongPress, endTimer]
}