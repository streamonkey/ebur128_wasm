import { LoudnessMeter } from "./lib/loudness"

const ebur128 = new LoudnessMeter()

const fileIn = document.getElementById("file") as HTMLInputElement

const decodeTimeOut = document.getElementById("decodingTime") as HTMLTableCellElement

const loudnessOut = document.getElementById("loudness-i") as HTMLTableCellElement

const truePeakOut = document.getElementById("true-peak") as HTMLTableCellElement

fileIn.addEventListener("change", async () => {
  decodeTimeOut.innerHTML = "decoding..."
  loudnessOut.innerHTML = ""
  truePeakOut.innerHTML = ""
  const file = fileIn.files![0]
  const audioCtx = new AudioContext()
  const decodeStart = performance.now()
  const audioBuffer = await audioCtx.decodeAudioData(await file.arrayBuffer())
  const decodeEnd = performance.now()

  decodeTimeOut.innerText = (decodeEnd - decodeStart).toFixed(2) + "ms"

  loudnessOut.innerHTML = "calculating..."
  const loudStart = performance.now()
  let loudness = await ebur128.loudnessIntegrated(audioBuffer)
  const loudEnd = performance.now()

  loudnessOut.innerText = `${loudness.toFixed(2)} LUFS (took ${(loudEnd - loudStart).toFixed(2)}ms)`

  truePeakOut.innerHTML = "calculating..."
  const peakStart = performance.now()

  let truePeak = await ebur128.truePeak(audioBuffer)
  const peakEnd = performance.now()

  truePeakOut.innerText = `${truePeak.toFixed(2)} dBTP (took ${(peakEnd - peakStart).toFixed(2)}ms)`
})
