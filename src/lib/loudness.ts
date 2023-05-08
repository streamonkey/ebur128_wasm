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

    private async sendToWorker(task: InputData["task"], buffer: AudioBuffer) {
        const channels = getChannels(buffer)

        await this.ready

        if (this.error) {
            throw new Error("worker is in error state", { cause: this.error })
        }

        const backchannel = new MessageChannel()

        return new Promise<number>((resolve, _) => {
            backchannel.port1.addEventListener(
                "message",
                e => {
                    const data = e.data as OutputData

                    backchannel.port1.close()
                    resolve(data.result)
                },
                { once: true }
            )

            const message: InputData = {
                task: task,
                samplerate: buffer.sampleRate,
                channelData: channels
            }

            backchannel.port1.start()

            this.loudnessWorker.postMessage(message, [backchannel.port2])
        })
    }

    loudnessIntegrated = async (buffer: AudioBuffer) => {
        return await this.sendToWorker("loudnessIntegrated", buffer)
    }

    truePeak = async (buffer: AudioBuffer) => {
        return await this.sendToWorker("truePeak", buffer)
    }
}
