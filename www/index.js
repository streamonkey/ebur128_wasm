import * as wasm from "ebur128-wasm"

/**
 * @type {HTMLInputElement}
 */
const fileIn = document.getElementById("file")

/**
 * @type {HTMLTableCellElement}
 */
const decodeTimeOut = document.getElementById("decodingTime")

/**
 * @type {HTMLTableCellElement}
 */
const loudnessOut = document.getElementById("loudness-i")

/**
 * @type {HTMLTableCellElement}
 */
const truePeakOut = document.getElementById("true-peak")

fileIn.addEventListener("change", async () => {
    decodeTimeOut.innerHTML = "decoding..."
    loudnessOut.innerHTML = ""
    truePeakOut.innerHTML = ""
    const file = fileIn.files[0]
    const audioCtx = new AudioContext()
    const decodeStart = performance.now()
    const audioBuffer = await audioCtx.decodeAudioData(await file.arrayBuffer())
    const decodeEnd = performance.now()

    decodeTimeOut.innerText = (decodeEnd - decodeStart).toFixed(2) + "ms"

    const channels = getChannels(audioBuffer)

    let loudness
    loudnessOut.innerHTML = "calculating..."
    const loudStart = Date.now()
    if (channels.length == 1) {
        loudness = wasm.ebur128_integrated_mono(audioBuffer.sampleRate, channels[0])
    } else if (channels.length == 2) {
        loudness = wasm.ebur128_integrated_stereo(audioBuffer.sampleRate, channels[0], channels[1])
    }
    const loudEnd = Date.now()

    loudnessOut.innerText = `${loudness.toFixed(2)} LUFS (took ${(loudEnd - loudStart).toFixed(2)}ms)`

    let truePeak

    truePeakOut.innerHTML = "calculating..."
    const peakStart = Date.now()

    if (channels.length == 1) {
        truePeak = wasm.ebur128_true_peak_mono(audioBuffer.sampleRate, channels[0])
    } else if (channels.length == 2) {
        truePeak = wasm.ebur128_true_peak_stereo(audioBuffer.sampleRate, channels[0], channels[1])
    }
    const peakEnd = Date.now()

    truePeakOut.innerText = `${truePeak.toFixed(2)} dBTP (took ${(peakEnd - peakStart).toFixed(2)}ms)`
})

const createArray = (length, fn) => {
    return Array.from({ length }, (_, i) => fn(i))
}

const getChannels = (buf) => {
    return createArray(buf.numberOfChannels, i => buf.getChannelData(i))
}
