
function isOutOfBounds(cell_x, cell_y){
    return (((cell_x < 0) || (8 <= cell_x)) || ((cell_y < 0) || (8 <= cell_y))) //check bounds
}

function evaluateMove(target_cell, board, player_color){
    const [cell_y, cell_x] = target_cell
    let is_possible
    let piece

    if (isOutOfBounds(cell_x, cell_y)) {
        is_possible = false
        piece = null
    } else {
        piece = board[cell_y][cell_x]
        if (piece === null){
            is_possible = true
        } else {
            if (piece.color === player_color){
                is_possible = false
            } else {
                is_possible = true
            }
        }
    }
    return {is_possible: is_possible, piece: piece}
}

function isCellFree(target_cell, board, player_color){
    const move = evaluateMove(target_cell, board, player_color)
    return (!move.piece && move.is_possible)
}

module.exports = {
    isOutOfBounds,
    evaluateMove,
    isCellFree
}
