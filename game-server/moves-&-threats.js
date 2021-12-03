
const { isOutOfBounds, evaluateMove, isCellFree } = require('./move-evaluation')

// highlight a line from cell: horizontal, vertical or diagonal
function possibleMovesLine(initial_cell, board, player_color, x_inc, y_inc){
    const possible_moves = []
    const target_cell = initial_cell.slice()
    let move

    do {
        target_cell[1] += x_inc
        target_cell[0] += y_inc

        move = evaluateMove(target_cell, board, player_color)
        if (move.is_possible){
            const target_cell_copy = target_cell.slice()
            possible_moves.push({cell: target_cell_copy, piece: move.piece})
        }
    } while (move.is_possible && (move.piece === null))

    return possible_moves
}

// highlight board horizontally and vertically (like a cross on selected cell)
function possibleMovesRook(cell, board, player_color){

    const possible_moves_left = possibleMovesLine(cell, board, player_color, -1, 0)
    const possible_moves_right = possibleMovesLine(cell, board, player_color, 1, 0)
    const possible_moves_bottom = possibleMovesLine(cell, board, player_color, 0, -1)
    const possible_moves_top = possibleMovesLine(cell, board, player_color, 0, 1)

    const possible_moves = [...possible_moves_left, ...possible_moves_right, ...possible_moves_bottom, ...possible_moves_top]
    return possible_moves
}

// highlight board diagonally (like an X on selected cell)
function possibleMovesBishop(cell, board, player_color){

    const possible_moves_topleft = possibleMovesLine(cell, board, player_color, -1, 1)
    const possible_moves_topright = possibleMovesLine(cell, board, player_color, 1, 1)
    const possible_moves_bottomleft = possibleMovesLine(cell, board, player_color, -1, -1)
    const possible_moves_bottomright = possibleMovesLine(cell, board, player_color, 1, -1)

    const possible_moves = [...possible_moves_topleft, ...possible_moves_topright, ...possible_moves_bottomleft, ...possible_moves_bottomright]
    return possible_moves
}

function possibleMovesQueen(cell, board, player_color){

    const possible_moves_cross = possibleMovesRook(cell, board, player_color)
    const possible_moves_diag = possibleMovesBishop(cell, board, player_color)

    const possible_moves = [...possible_moves_cross, ...possible_moves_diag]
    return possible_moves
}

function possibleMovesKnight(cell, board, player_color){
    const possible_moves = []
    const [cell_y, cell_x] = cell

    for (let x of [1, 2]){
        let y = (x === 1) ? 2 : 1
        for (let x_sign of [-1, 1]){
            for (let y_sign of [-1, 1]){
                const target_cell = [(cell_y + y * y_sign), (cell_x + x * x_sign)]
                const move = evaluateMove(target_cell, board, player_color)
                if (move.is_possible){
                    possible_moves.push({cell: target_cell, piece: move.piece})
                }
            }
        }
    }
    return possible_moves
}

// making the function recursive was considered, but not done because it would increase complexity for minimum benefit
function possibleMovesPawnMotion(initial_cell, board, player_color, y_sign){
    const possible_moves = []

    const target_cell_1 = initial_cell.slice()
    target_cell_1[0] += y_sign

    if (isCellFree(target_cell_1, board, player_color)){
        const move_1 = evaluateMove(target_cell_1, board, player_color)
        possible_moves.push({cell: target_cell_1, piece: move_1.piece})

        const pawn_row = (player_color === 'white') ? 6 : 1

        if (initial_cell[0] === pawn_row){
            const target_cell_2 = target_cell_1.slice()
            target_cell_2[0] += y_sign

            if (isCellFree(target_cell_2, board, player_color)){
                const move_2 = evaluateMove(target_cell_2, board, player_color)
                possible_moves.push({cell: target_cell_2, piece: move_2.piece})
            }
        }
    }
    return possible_moves
}

function possiblePawnRegularCapture(initial_cell, board, player_color, y_sign, x_sign){
    const possible_move = []

    const target_cell = initial_cell.slice()
    target_cell[0] += y_sign
    target_cell[1] += x_sign
    const move = evaluateMove(target_cell, board, player_color)
    if (move.piece && move.is_possible){
        possible_move.push({cell: target_cell, piece: move.piece})
    }

    return possible_move
}

function possiblePawnEnPassantCapture(initial_cell, board, player_color, y_sign, x_sign){
    const possible_move = []

    const target_cell = initial_cell.slice()
    target_cell[1] += x_sign
    const move = evaluateMove(target_cell, board, player_color)
    if (move.piece?.has_moved_double && move.is_possible){
        const final_cell = [target_cell[0] + y_sign, target_cell[1]]
        possible_move.push({cell: final_cell, piece: move.piece, en_passant_captured_cell: target_cell})
    }

    return possible_move
}

function possibleMovesPawnCapture(cell, board, player_color, y_sign){
    const possible_moves = []

    for (let x_sign of [-1, 1]){

        const possible_move_regular = possiblePawnRegularCapture(cell, board, player_color, y_sign, x_sign)
        const possible_move_en_passant = possiblePawnEnPassantCapture(cell, board, player_color, y_sign, x_sign)

        possible_moves.push(...possible_move_regular, ...possible_move_en_passant)
    }

    return possible_moves
}

function possibleMovesPawn(cell, board, player_color){
    const y_sign = (player_color === 'white') ? -1 : 1

    const possible_moves_motion = possibleMovesPawnMotion(cell, board, player_color, y_sign)
    const possible_moves_capture = possibleMovesPawnCapture(cell, board, player_color, y_sign)

    const possible_moves = [...possible_moves_motion, ...possible_moves_capture]
    return possible_moves
}

function getEnemyKingCellIfItIsIn5x5RangeOfPlayerCell(cell, board, player_color){
    const [cell_y, cell_x] = cell

    for (let y_inc of [-2, -1, 0, 1, 2]){
        for (let x_inc of [-2, -1, 0, 1, 2]){
            const target_cell = [cell_y + y_inc, cell_x + x_inc]
            const move = evaluateMove(target_cell, board, player_color)
            if (move.is_possible && (move.piece?.type === 'king')){
                return target_cell
            }
        }
    }
    return null
}

function getCellsSurroundingEnemyKingIfItIsIn5x5RangeOfPlayerCell(cell, board, player_color){
    const enemy_king_cell_in_range = getEnemyKingCellIfItIsIn5x5RangeOfPlayerCell(cell, board, player_color)
    const threatened_cells = []
    if (enemy_king_cell_in_range){
        const [cell_y, cell_x] = enemy_king_cell_in_range
        for (let x of [-1, 0, 1]){
            for (let y of [-1, 0, 1]){
                const target_cell = [cell_y + y, cell_x + x]
                if (!isOutOfBounds(target_cell[0], target_cell[1])){
                    threatened_cells.push(target_cell)
                }
            }
        }
    }
    return threatened_cells
}

function isPossibleMoveCellInListOfThreatendCells(possible_move, threatened_cells){
    const [y_possible, x_possible] = possible_move.cell
    for (let threatened_cell of threatened_cells){
        const [y_threat, x_threat] = threatened_cell
        if ((y_possible === y_threat) && (x_possible === x_threat)){
            return true
        }
    }
    return false
}

function filterPossibleMovesToStayAwayFromOtherPlayersKing(cell, board, player_color, possible_moves){
    const threatened_cells = getCellsSurroundingEnemyKingIfItIsIn5x5RangeOfPlayerCell(cell, board, player_color)
    let filtered_moves = []

    if ((threatened_cells.length > 0) && (possible_moves.length > 0)){
        for (let possible_move of possible_moves){
            if (isPossibleMoveCellInListOfThreatendCells(possible_move, threatened_cells) === false){
                filtered_moves.push(possible_move)
            }
        }
    } else {
        filtered_moves = possible_moves
    }

    return filtered_moves
}

function possibleMovesKingRegular(cell_x, cell_y, board, player_color){
    const possible_moves = []
    const temp_board = JSON.parse(JSON.stringify(board))
    temp_board[cell_y][cell_x] = null

    for (let x of [-1, 0, 1]){
        for (let y of [-1, 0, 1]){
            if ((x === 0) && (y === 0)){
                continue
            }
            const target_cell = [cell_y + y, cell_x + x]
            const move = evaluateMove(target_cell, board, player_color)
            if (move.is_possible){
                const in_check = isCellThreatend(target_cell, temp_board, player_color, true)
                if (!in_check){
                    possible_moves.push({cell: target_cell, piece: move.piece})
                }
            }
        }
    }
    return possible_moves
}

function isQueensideCastlingPossible(cell_x, cell_y, board, player_color){
    const target_cell_1 = [cell_y, cell_x - 3]
    if (!isCellFree(target_cell_1, board, player_color)){
        return false
    }
    for (let x of [-1, -2]){
        const target_cell_2 = [cell_y, cell_x + x]
        if (!isCellFree(target_cell_2, board, player_color)){
            return false
        }
        if (isCellThreatend(target_cell_2, board, player_color, true)){
            return false
        }
    }
    return true
}

function isKingsideCastlingPossible(cell_x, cell_y, board, player_color){
    for (let x of [1, 2]){
        const target_cell = [cell_y, cell_x + x]
        if (!isCellFree(target_cell, board, player_color)){
            return false
        }
        if (isCellThreatend(target_cell, board, player_color, true)){
            return false
        }
    }
    return true
}

function possibleKingCastlingMoveLeft(cell_x, cell_y, board, player_color){
    const possible_move = []

    const left_rook = board[cell_y][0]
    if (left_rook?.has_not_moved){
        const is_castling_possible = isQueensideCastlingPossible(cell_x, cell_y, board, player_color)
        if (is_castling_possible){
            const target_cell = [cell_y, cell_x - 2]
            possible_move.push({cell: target_cell, piece: null, castling: 'left'})
        }
    }
    return possible_move
}

function possibleKingCastlingMoveRight(cell_x, cell_y, board, player_color){
    const possible_move = []

    const right_rook = board[cell_y][7]
    if (right_rook?.has_not_moved){
        const is_castling_possible = isKingsideCastlingPossible(cell_x, cell_y, board, player_color)
        if (is_castling_possible){
            const target_cell = [cell_y, cell_x + 2]
            possible_move.push({cell: target_cell, piece: null, castling: 'right'})
        }
    }
    return possible_move
}

function possibleMovesKingCastling(cell_x, cell_y, board, player_color){
    const possible_moves = []

    const king = board[cell_y][cell_x]
    if (king?.has_not_moved){
        const possible_castling_move_left = possibleKingCastlingMoveLeft(cell_x, cell_y, board, player_color)
        const possible_castling_move_right = possibleKingCastlingMoveRight(cell_x, cell_y, board, player_color)

        possible_moves.push(...possible_castling_move_left, ...possible_castling_move_right)
    }

    return possible_moves
}

function possibleMovesKing(cell, board, player_color){
    const [cell_y, cell_x] = cell

    const possible_moves_regular = possibleMovesKingRegular(cell_x, cell_y, board, player_color)
    const possible_moves_castling = possibleMovesKingCastling(cell_x, cell_y, board, player_color)

    const possible_moves = [...possible_moves_regular, ...possible_moves_castling]
    const filtered_possible_moves = filterPossibleMovesToStayAwayFromOtherPlayersKing(cell, board, player_color, possible_moves)
    return filtered_possible_moves
}

function possibleMoves(cell, type, board, player_color){
    let possible_moves
    switch (type) {
        case 'king':
            possible_moves = possibleMovesKing(cell, board, player_color)
            break;
        case 'queen':
            possible_moves = possibleMovesQueen(cell, board, player_color)
            break;
        case 'rook':
            possible_moves = possibleMovesRook(cell, board, player_color)
            break;
        case 'bishop':
            possible_moves = possibleMovesBishop(cell, board, player_color)
            break;
        case 'knight':
            possible_moves = possibleMovesKnight(cell, board, player_color)
            break;
        case 'pawn':
            possible_moves = possibleMovesPawn(cell, board, player_color)
            break;
        default:
            possible_moves = []
            break;
    }

    return possible_moves
}

function filterPossibleMovesForType(possible_moves, searched_type){
    return possible_moves.filter((possible_move) => {return (possible_move.piece?.type === searched_type)})
}

function getThreateningAdjacentPawn(cell, board, player_color){
    const [cell_y, cell_x] = cell
    const y_sign = (player_color === 'white') ? -1 : 1
    const threatening_moves = []

    for (let x_sign of [-1, 1]){
        const target_cell = [cell_y + y_sign, cell_x + x_sign]
        const move = evaluateMove(target_cell, board, player_color)
        if (move.is_possible && (move.piece?.type === 'pawn') && (move.piece?.color !== player_color)){
            threatening_moves.push({cell: target_cell, piece: move.piece})
        }
    }
    return threatening_moves
}

function getThreateningPiecesOfSpecifiedType(cell, type, board, player_color){

    if (type === 'pawn') {
        return getThreateningAdjacentPawn(cell, board, player_color)
    }

    const possible_moves = possibleMoves(cell, type, board, player_color)
    const threatening_moves = filterPossibleMovesForType(possible_moves, type)
    return threatening_moves
}

// is_king_asking flag is used to prevent a loop: only use 'true' when calculating king's possible moves
function isCellThreatend(cell, board, player_color, is_king_asking = false){

    const all_types = ['queen', 'rook', 'bishop', 'knight', 'pawn']
    if (is_king_asking === false){
        all_types.push('king')
    }
    for (let type of all_types){
        const threat = getThreateningPiecesOfSpecifiedType(cell, type, board, player_color)
        if (threat?.length > 0){
            return true
        }
    }
    return false
}

function getThreateningPieces(cell, board, player_color){
    const threatening_moves = []

    for (let type of ['queen', 'rook', 'bishop', 'knight', 'pawn', 'king']){
        let threat = getThreateningPiecesOfSpecifiedType(cell, type, board, player_color)
        threatening_moves.push(...threat)
    }

    return threatening_moves
}

function isKingInCheck(board, player_color, kings_cell){
    return isCellThreatend(kings_cell, board, player_color)
}

function getPiecesThreateningKing(board, player_color, kings_cell){
    return getThreateningPieces(kings_cell, board, player_color)
}

module.exports = {
    possibleMovesKing,
    possibleMoves,
    isCellThreatend,
    getThreateningPieces,
    isKingInCheck,
    getPiecesThreateningKing
}
