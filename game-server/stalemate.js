
const { possibleMoves, isKingInCheck } = require('./moves-&-threats')

function canPlayerMove(board, player_color){
    for (let y = 0; y < 8; y++){
        for (let x = 0; x < 8; x++){
            const piece = board[y][x]
            if (piece && (piece?.color === player_color)){
                const cell = [y, x]
                const type = piece.type
                const possible_moves = possibleMoves(cell, type, board, player_color)
                if (possible_moves.length > 0){
                    return true
                }
            }
        }
    }
    return false
}

// 'is_in_check' is an optional argument, it takes a boolean representing whether the players king is in check
function isPlayerInStalemate(board, player_color, kings_cell, is_in_check = undefined){
    const is_king_in_check = (is_in_check === undefined) ? isKingInCheck(board, player_color, kings_cell) : is_in_check
    if (!canPlayerMove(board, player_color) && !is_king_in_check){
        return true
    }
    return false
}

module.exports = {
    isPlayerInStalemate
}
