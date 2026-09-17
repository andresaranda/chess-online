
let stockfish_worker_g = null
let stockfish_message_handler_g = null
let stockfish_wait_timeout_id_g = null
let stockfish_search_promise_g = null

function clearStockfishWaiter(){
    if (stockfish_worker_g && stockfish_message_handler_g){
        stockfish_worker_g.removeEventListener('message', stockfish_message_handler_g)
    }
    if (stockfish_wait_timeout_id_g !== null){
        clearTimeout(stockfish_wait_timeout_id_g)
        stockfish_wait_timeout_id_g = null
    }
    stockfish_message_handler_g = null
}

function resetStockfishEngine(){
    clearStockfishWaiter()
    if (stockfish_worker_g){
        try {
            stockfish_worker_g.postMessage('__terminate__')
        } catch (error) {
        }
        try {
            stockfish_worker_g.terminate()
        } catch (error) {
            console.log('Stockfish terminate error:', error)
        }
    }
    stockfish_worker_g = null
}

function createStockfishWorker(){
    resetStockfishEngine()
    stockfish_worker_g = new Worker('/js/stockfish/stockfish-bridge.js')
    stockfish_worker_g.onerror = (error) => {
        console.log('Stockfish worker error:', error.message || error)
        resetStockfishEngine()
    }
    return stockfish_worker_g
}

function sendStockfishCommand(command){
    if (!stockfish_worker_g){
        throw new Error('Stockfish worker is not available')
    }
    stockfish_worker_g.postMessage(command)
}

function doesStockfishMessageMatch(message, expected_prefix){
    return (message === expected_prefix) || message.startsWith(expected_prefix + ' ')
}

function waitForStockfishMessage(expected_prefix, timeout_ms){
    return new Promise((resolve, reject) => {
        if (!stockfish_worker_g){
            reject(new Error('Stockfish worker is not available'))
            return
        }

        clearStockfishWaiter()

        stockfish_wait_timeout_id_g = setTimeout(() => {
            clearStockfishWaiter()
            reject(new Error(`Stockfish timed out waiting for: ${expected_prefix}`))
        }, timeout_ms)

        stockfish_message_handler_g = (event) => {
            const message = String(event.data)
            if (message.startsWith('worker-error')){
                clearStockfishWaiter()
                reject(new Error(message))
                return
            }
            if (doesStockfishMessageMatch(message, expected_prefix)){
                clearStockfishWaiter()
                resolve(message)
            }
        }

        stockfish_worker_g.addEventListener('message', stockfish_message_handler_g)
    })
}

function getBestMoveFromStockfish(fen, skill_level, move_time_ms){
    const validated_skill_level = Number.isFinite(skill_level) ? skill_level : 9
    const validated_move_time_ms = (Number.isFinite(move_time_ms) && (move_time_ms > 0)) ? move_time_ms : 600
    const search_depth = (validated_skill_level >= 15) ? 10 : ((validated_skill_level >= 8) ? 7 : 4)

    if (stockfish_search_promise_g){
        return stockfish_search_promise_g.catch(() => null).then(() => {
            return getBestMoveFromStockfish(fen, validated_skill_level, validated_move_time_ms)
        })
    }

    createStockfishWorker()

    const uci_ready = waitForStockfishMessage('uciok', 20000)
    sendStockfishCommand('uci')

    stockfish_search_promise_g = uci_ready.then(() => {
        sendStockfishCommand(`setoption name Skill Level value ${validated_skill_level}`)
        const engine_ready = waitForStockfishMessage('readyok', 10000)
        sendStockfishCommand('isready')
        return engine_ready
    }).then(() => {
        sendStockfishCommand(`position fen ${fen}`)
        const best_move_ready = waitForStockfishMessage('bestmove', validated_move_time_ms + 5000)
        sendStockfishCommand(`go depth ${search_depth} movetime ${validated_move_time_ms}`)
        return best_move_ready
    }).then((best_move_message) => {
        return best_move_message.split(/\s+/)[1]
    }).finally(() => {
        resetStockfishEngine()
        stockfish_search_promise_g = null
    })

    return stockfish_search_promise_g
}
