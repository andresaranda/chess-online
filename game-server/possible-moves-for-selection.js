
const { isOutOfBounds } = require('./move-evaluation')
const { possibleMoves, getPiecesThreateningKing } = require('./moves-&-threats')

function areTwoCellsInSameLine(cell_1, cell_2){
    const y_abs = Math.abs(cell_2[0] - cell_1[0])
    const x_abs = Math.abs(cell_2[1] - cell_1[1])
    return (cell_1[0] === cell_2[0] || cell_1[1] === cell_2[1] || y_abs === x_abs)
}

// if two cells not in same line are passed, it will return their direction in the 8 ordinal and cardinal points
function getIncrementerBetweenTwoCellsInSameLineFrom1To2(cell_1, cell_2){
    const y = cell_2[0] - cell_1[0]
    const x = cell_2[1] - cell_1[1]
    const y_inc = (y === 0) ? 0 : y/Math.abs(y)
    const x_inc = (x === 0) ? 0 : x/Math.abs(x)
    return [y_inc, x_inc]
}

function filterPossibleMovesToLineBetweenTwoCells(possible_moves, cell_1, cell_2){
    const [y_inc, x_inc] = getIncrementerBetweenTwoCellsInSameLineFrom1To2(cell_2, cell_1)
    const [y_cell2, x_cell2] = cell_2
    const [y_cell1, x_cell1] = cell_1
    const filtered_possible_moves = []

    const [x_min, x_max] = (x_cell2 > x_cell1) ? [x_cell1, x_cell2] : [x_cell2, x_cell1]
    const [y_min, y_max] = (y_cell2 > y_cell1) ? [y_cell1, y_cell2] : [y_cell2, y_cell1]

    const slope = (x_inc === 0) ? 1 : y_inc / x_inc
    const constant = y_cell2 - (x_cell2 * slope)

    for (let possible_move of possible_moves){
        const [y_move, x_move] = possible_move.cell
        if (x_inc === 0){
            if ((x_move === x_cell2) && (y_move > y_min) && (y_move < y_max)){
                filtered_possible_moves.push(possible_move)
            }
        } else {
            const y_calc = (x_move * slope) + constant
            if ((y_move == y_calc) && (x_move > x_min) && (x_move < x_max)){
                filtered_possible_moves.push(possible_move)
            }
        }
    }

    return filtered_possible_moves
}

function filterPossibleMovesToCaptureThreat(possible_moves, threat){
    let capture_threat_move = []
    const threat_id = threat.piece.id
    for (let possible_move of possible_moves){
        if (possible_move.piece?.id === threat_id){
            capture_threat_move = [possible_move]
            break
        }
    }
    return capture_threat_move
}

function filterPossibleMovesToBlockThreat(possible_moves, threat, kings_cell){
    const threat_type = threat?.piece.type
    if (threat_type === 'pawn' || threat_type === 'knight' || threat_type === 'king' || threat_type === undefined){
        return []
    }
    
    const block_threat_moves = filterPossibleMovesToLineBetweenTwoCells(possible_moves, threat.cell, kings_cell)
    return block_threat_moves
}

// note: to be used by pieces other than king, NOT by selected king
function filterPossibleMovesToProtectKing(possible_moves, threat, kings_cell){

    const capture_threat_move = filterPossibleMovesToCaptureThreat(possible_moves, threat)

    const block_threat_moves = filterPossibleMovesToBlockThreat(possible_moves, threat, kings_cell)

    const filtered_possible_moves = [...capture_threat_move, ...block_threat_moves]
    return filtered_possible_moves
}

function potentialThreatIfPieceMoves(cell, piece, board, player_color, kings_cell){
    const is_in_line_of_king = areTwoCellsInSameLine(kings_cell, cell)
    if (!is_in_line_of_king){
        return null
    }

    let potential_threat = null

    const [y_inc, x_inc] = getIncrementerBetweenTwoCellsInSameLineFrom1To2(kings_cell, cell)
    const target_cell = kings_cell.slice()
    let target_piece
    let is_visible_to_king = false
    do {
        target_cell[0] += y_inc
        target_cell[1] += x_inc
        if (isOutOfBounds(target_cell[1], target_cell[0])){
            return null
        } else {
            target_piece = board[target_cell[0]][target_cell[1]]
        }
        if (!is_visible_to_king && (target_piece?.id === piece.id)){
            is_visible_to_king = true
            target_cell[0] += y_inc
            target_cell[1] += x_inc
            if (isOutOfBounds(target_cell[1], target_cell[0])){
                return null
            } else {
                target_piece = board[target_cell[0]][target_cell[1]]
            }
        }
        if (is_visible_to_king && (target_piece?.color !== player_color)){
            if (y_inc === 0 || x_inc === 0){
                if (target_piece?.type === 'queen' || target_piece?.type === 'rook'){
                    potential_threat = {cell: target_cell, piece: target_piece}
                }
            } else {
                if (target_piece?.type === 'queen' || target_piece?.type === 'bishop'){
                    potential_threat = {cell: target_cell, piece: target_piece}
                }
            }
        }
    } while (target_piece === null)

    return potential_threat
}

// cannot be called if there is no piece in cell selected
function getPossibleMovesForSelection(cell, board, player_color, kings_cell, threats_to_king = undefined){
    const threatening_moves = (threats_to_king === undefined) ? getPiecesThreateningKing(board, player_color, kings_cell) : threats_to_king
    const piece = board[cell[0]][cell[1]]

    let possible_moves = possibleMoves(cell, piece.type, board, player_color)

    if (piece.type !== 'king'){
        if (threatening_moves.length > 1){
            return []
        }

        const threat = threatening_moves[0]
        if (threat){
            possible_moves = filterPossibleMovesToProtectKing(possible_moves, threat, kings_cell)
        }
        const potential_threat = potentialThreatIfPieceMoves(cell, piece, board, player_color, kings_cell)
        if (potential_threat){
            possible_moves = filterPossibleMovesToProtectKing(possible_moves, potential_threat, kings_cell)
        }
    }

    return possible_moves
}

module.exports = {
    filterPossibleMovesToBlockThreat,
    getPossibleMovesForSelection
}
