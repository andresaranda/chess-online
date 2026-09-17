const { getPiecesThreateningKing } = require('./moves-&-threats')
const { canPlayerMove } = require('./possible-moves-for-selection')

function isPlayerInCheckmate(board, player_color, kings_cell, threats_to_king = undefined){
    const threatening_moves = (threats_to_king === undefined) ? getPiecesThreateningKing(board, player_color, kings_cell) : threats_to_king
    if (threatening_moves.length === 0){
        return false
    }
    if (canPlayerMove(board, player_color, kings_cell, threatening_moves)){
        return false
    }
    return true
}

module.exports = {
    isPlayerInCheckmate
}
