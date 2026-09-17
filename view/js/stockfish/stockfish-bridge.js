
let stockfish_engine = null

function ensureStockfishEngine(){
    if (!stockfish_engine){
        stockfish_engine = new Worker('/js/stockfish/stockfish-18-lite-single.js')
        stockfish_engine.onmessage = (event) => {
            const message = String(event.data)
            if (message.startsWith('info')){
                return
            }
            postMessage(message)
        }
        stockfish_engine.onerror = (error) => {
            postMessage(`worker-error ${error.message || 'unknown'}`)
        }
    }
    return stockfish_engine
}

onmessage = (event) => {
    const command = event.data

    if (command === '__terminate__'){
        if (stockfish_engine){
            try {
                stockfish_engine.terminate()
            } catch (error) {
            }
            stockfish_engine = null
        }
        close()
        return
    }

    ensureStockfishEngine().postMessage(command)
}
