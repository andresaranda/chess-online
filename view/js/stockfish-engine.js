
let stockfish_worker_g = null
let stockfish_is_initialized_g = false
let stockfish_message_handler_g = null

function getStockfishWorker(){
    if (!stockfish_worker_g){
        stockfish_worker_g = new Worker('/js/stockfish/stockfish-18-lite-single.js')
    }
    return stockfish_worker_g
}

function sendStockfishCommand(command){
    getStockfishWorker().postMessage(command)
}

function waitForStockfishMessage(expected_prefix){
    return new Promise((resolve, reject) => {
        const worker = getStockfishWorker()

        if (stockfish_message_handler_g){
            worker.removeEventListener('message', stockfish_message_handler_g)
        }

        const timeout_id = setTimeout(() => {
            worker.removeEventListener('message', stockfish_message_handler_g)
            stockfish_message_handler_g = null
            reject(new Error(`Stockfish timed out waiting for: ${expected_prefix}`))
        }, 20000)

        stockfish_message_handler_g = (event) => {
            const message = String(event.data)
            if (message === expected_prefix || message.startsWith(expected_prefix + ' ') || message.startsWith(expected_prefix)){
                clearTimeout(timeout_id)
                worker.removeEventListener('message', stockfish_message_handler_g)
                stockfish_message_handler_g = null
                resolve(message)
            }
        }

        worker.addEventListener('message', stockfish_message_handler_g)
    })
}

function initializeStockfish(){
    if (stockfish_is_initialized_g){
        return Promise.resolve()
    }

    const uci_ready = waitForStockfishMessage('uciok')
    sendStockfishCommand('uci')

    return uci_ready.then(() => {
        const engine_ready = waitForStockfishMessage('readyok')
        sendStockfishCommand('isready')
        return engine_ready
    }).then(() => {
        stockfish_is_initialized_g = true
    })
}

function getBestMoveFromStockfish(fen, skill_level, move_time_ms){
    return initializeStockfish().then(() => {
        sendStockfishCommand(`setoption name Skill Level value ${skill_level}`)
        sendStockfishCommand('ucinewgame')
        sendStockfishCommand(`position fen ${fen}`)
        const best_move_ready = waitForStockfishMessage('bestmove')
        sendStockfishCommand(`go movetime ${move_time_ms}`)
        return best_move_ready
    }).then((best_move_message) => {
        return best_move_message.split(/\s+/)[1]
    })
}
