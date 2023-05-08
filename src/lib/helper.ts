/**
 * get all channels as float32 arrays
 * 
 * clone the channels to work around FF bug
 */
export const getChannels = (audio: AudioBuffer) => {
    return Array.from({ length: audio.numberOfChannels }, (_, i) => audio.getChannelData(i).slice())
}

/**
 * a mutex that can be used with await
 */
export const newMutex = (): [Promise<void>, () => void] => {
    let resolve: () => void
    const promise = new Promise<void>(res => {
        resolve = res
    })
    return [promise, resolve!]
}
