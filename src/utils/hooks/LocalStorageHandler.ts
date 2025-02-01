import { useState } from 'react'
import API from '../API'

export function getStoredData(key: string, version: number, defaultValue?: any, parser?: (value: any) => any): any {
    const storedData = localStorage.getItem(key)
    if (storedData) {
        try {
            const parsedData = JSON.parse(storedData)
            if (parsedData && typeof parsedData === 'object' && 'version' in parsedData && parsedData.version === version && 'data' in parsedData) {
                if (parser) return parser(parsedData.data)
                return parsedData.data
            }
        } catch (e) { }
    }

    saveData(key, version, defaultValue)
    return defaultValue
}

export function saveData(key: string, version: number, value: any) {
    try {
        localStorage.setItem(key, JSON.stringify({
            version: version,
            data: value
        }))
    } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            API.log({ message: 'Quota exceeded', date: Date.now() })
        }
    }
}

export function useLocalStorage<T>(key: string, version: number, defaultValue: T, parser: (value: any) => T = (value) => value): [T, (value: T) => void] {
    const [localStorageValue, setLocalStorageValue] = useState(getStoredData(key, version, defaultValue, parser))

    const setLocalStorageStateValue = (value: T) => {
        saveData(key, version, value)
        setLocalStorageValue(value)
    }
    return [localStorageValue, setLocalStorageStateValue]
}
