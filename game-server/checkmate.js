
const { possibleMovesKing, isCellThreatend, getPiecesThreateningKing } = require('./moves-&-threats')
const { filterPossibleMovesToBlockThreat } = require('./possible-moves-for-selection')

function getAllNullMovesWithinRange(board, cell_1, cell_2){
    const [y_cell2, x_cell2] = cell_2
    const [y_cell1, x_cell1] = cell_1
    const [x_min, x_max] = (x_cell2 > x_cell1) ? [x_cell1, x_cell2] : [x_cell2, x_cell1]
    const [y_min, y_max] = (y_cell2 > y_cell1) ? [y_cell1, y_cell2] : [y_cell2, y_cell1]

    const null_moves = []
    for (let y = y_min; y <= y_max; y++){
        for (let x = x_min; x <= x_max; x++){
            const piece = board?.[y]?.[x]
            if (piece === null){
                null_moves.push({cell: [y, x], piece: null})
            }
        }
    }
    return null_moves
}

function isThreatBlockable(threat, board, player_color, kings_cell){
    const enemy_color = (player_color === 'white') ? 'black' : 'white'

    const null_moves = getAllNullMovesWithinRange(board, threat.cell, kings_cell)
    const blocking_moves = filterPossibleMovesToBlockThreat(null_moves, threat, kings_cell)
    for (let blocking_move of blocking_moves){
        const is_blockable = isCellThreatend(blocking_move.cell, board, enemy_color)
        if (is_blockable){
            return true
        }
    }
    return false
}

function isPlayerInCheckmate(board, player_color, kings_cell, threats_to_king = undefined){
    const threatening_moves = (threats_to_king === undefined) ? getPiecesThreateningKing(board, player_color, kings_cell) : threats_to_king
    if (threatening_moves.length === 0){
        return false
    }
    const possible_moves_king = possibleMovesKing(kings_cell, board, player_color)
    if (possible_moves_king.length > 0){
        return false
    } else if (threatening_moves.length > 1){
        return true
    }
    const threat = threatening_moves[0]
    const enemy_color = (player_color === 'white') ? 'black' : 'white'
    const can_enemy_be_captured = isCellThreatend(threat.cell, board, enemy_color)
    if (can_enemy_be_captured){
        return false
    }
    const can_enemy_be_blocked = isThreatBlockable(threat, board, player_color, kings_cell)
    if (can_enemy_be_blocked){
        return false
    }
    return true
}

module.exports = {
    isPlayerInCheckmate
}
