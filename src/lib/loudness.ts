import { getChannels, newMutex } from "./helper"
import type { InputData, OutputData } from "./loudness.worker"
import LoudnessWorker from "./loudness.worker.ts?worker"

export class LoudnessMeter {
    private loudnessWorker: Worker
    private error: Error | null = null
    private ready: Promise<void>

    constructor() {
        const [ready, setReady] = newMutex()
        this.ready = ready
        this.loudnessWorker = new LoudnessWorker()

        this.loudnessWorker.addEventListener("message", e => {
            if (e.data === "ready") {
                setReady()
            }
        })

        this.loudnessWorker.addEventListener("error", err => {
            this.error = new Error(err.message)
            console.log("worker error", err)
        })
    }

    private async sendToWorker<T extends OutputData["result"]>(
        task: InputData["task"],
        buffer: AudioBuffer,
        stepMs?: number
    ) {
        const channels = getChannels(buffer)

        await this.ready

        if (this.error) {
            throw new Error("worker is in error state", { cause: this.error })
        }

        const backchannel = new MessageChannel()

        return new Promise<T>((resolve, _) => {
            backchannel.port1.addEventListener(
                "message",
                e => {
                    const data = e.data as OutputData

                    backchannel.port1.close()
                    resolve(data.result as T)
                },
                { once: true }
            )

            const message: InputData = {
                task: task,
                samplerate: buffer.sampleRate,
                channelData: channels,
                stepMs
            }

            backchannel.port1.start()

            this.loudnessWorker.postMessage(message, [backchannel.port2])
        })
    }

    loudnessIntegrated = async (buffer: AudioBuffer) => {
        return await this.sendToWorker<number>("loudnessIntegrated", buffer)
    }

    truePeak = async (buffer: AudioBuffer) => {
        return await this.sendToWorker<number>("truePeak", buffer)
    }

    /**
     * short-term loudness (LUFS) at the end of each step of stepMs and the true peak (dBTP) within it,
     * interleaved as [lufs_0, peak_db_0, lufs_1, peak_db_1, ...]
     * -Infinity marks silence; during the first 3 s the window is padded with silence, so these values read low
     */
    shortTerm = async (buffer: AudioBuffer, stepMs: number) => {
        if (!Number.isInteger(stepMs) || stepMs < 1 || stepMs > 0xffffffff) {
            throw new RangeError("stepMs must be a positive 32-bit integer")
        }
        return await this.sendToWorker<Float64Array>("shortTerm", buffer, stepMs)
    }
}
