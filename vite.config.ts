import * as path from 'path'
import { defineConfig } from 'vite'
import wasmPack from 'vite-plugin-wasm-pack'
import dts from 'vite-plugin-dts'

export default defineConfig({
    plugins: [wasmPack('./ebur128-crate'), dts({
        entryRoot: path.resolve(__dirname, "src/lib"),
    })],
    build: {
        outDir: "dist",
        target: "esnext",
        lib: {
            entry: path.resolve(__dirname, "src/lib/loudness.ts"),
            formats: ["es"],
            name: "ebur128_wasm",
            fileName: "browser",
        },
        emptyOutDir: true,
        minify: "esbuild",
        sourcemap: false,
    },
    worker: {
        format: "iife"
    }
})