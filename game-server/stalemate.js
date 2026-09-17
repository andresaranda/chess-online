const { isKingInCheck } = require('./moves-&-threats')
const { canPlayerMove } = require('./possible-moves-for-selection')

// 'is_in_check' is an optional argument, it takes a boolean representing whether the players king is in check
function isPlayerInStalemate(board, player_color, kings_cell, is_in_check = undefined){
    const is_king_in_check = (is_in_check === undefined) ? isKingInCheck(board, player_color, kings_cell) : is_in_check
    if (!canPlayerMove(board, player_color, kings_cell) && !is_king_in_check){
        return true
    }
    return false
}

module.exports = {
    isPlayerInStalemate
}
