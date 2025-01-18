export function decodeMissionString(_: string): string {
    const encoder = '.:;!$%&()*+,-/<=>?@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`{}|~#'
    let result = ''
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    for (let i = 0; i < _.length; i++) {
        if (numbers.includes(_[i])) result += _[i]
        else {
            const index = encoder.indexOf(_[i])
            if (index === -1) return ''
            for (let n = 0; n < index + 1; n++) result += '0'
        }
    }
    return result
}
