import * as wasm from "ebur128-crate"

export interface InputData {
    task: "loudnessIntegrated" | "truePeak"
    samplerate: number
    channelData: Float32Array[]
}

export interface OutputData {
    result: number
}

onmessage = async (e: MessageEvent<InputData>) => {
    let result

    const backchannel = e.ports[0]

    if (e.data.task === "loudnessIntegrated") {
        switch (e.data.channelData.length) {
            case 1:
                result = wasm.ebur128_integrated_mono(e.data.samplerate, e.data.channelData[0])
                break
            case 2:
                result = wasm.ebur128_integrated_stereo(
                    e.data.samplerate,
                    e.data.channelData[0],
                    e.data.channelData[1]
                )
                break
            default:
                throw new Error("unsupported number of channels")
        }
    } else {
        switch (e.data.channelData.length) {
            case 1:
                result = wasm.ebur128_true_peak_mono(e.data.samplerate, e.data.channelData[0])
                break
            case 2:
                result = wasm.ebur128_true_peak_stereo(
                    e.data.samplerate,
                    e.data.channelData[0],
                    e.data.channelData[1]
                )
                break
            default:
                throw new Error("unsupported number of channels")
        }
    }

    const out: OutputData = {
        result
    }

    backchannel.postMessage(out)

    backchannel.close()
}

wasm.default().then(() => {
    postMessage("ready")
})
