import { defineConfig } from 'vite'

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
    root: 'src/',
    publicDir: '../static/',
    base: './',
    server:
    {
        host: true,
        open: !isCodeSandbox // Open if it's not a CodeSandbox
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            input: {
              main: '/index.html',
              playground: '/playground/playground.html',
              apollogame: '/playground/apps/apollogame.html',
              aresian: '/playground/apps/aresian.html',
              dakku: '/playground/apps/dakku.html',
              eve: '/playground/apps/eve.html',
              internalstructure: '/playground/apps/internalstructure.html',
              microscopy: '/playground/apps/microscopy.html',
              rabbitGo: '/playground/apps/rabbitGo.html',
              sphericalHarmonics: '/playground/apps/sphericalHarmonics.html',
              zjiderveldPlot: '/playground/apps/zjiderveldPlot.html',
            }
        }
    }
}
