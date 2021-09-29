
// White Pieces: Kw, Qw, Rw, Bw, Nw, pw
// Black Pieces: Kb, Qb, Rb, Bb, Nb, pb
// Free Tile: null

// selected_cell: [row,col]
// board: [[row1], [row2], [row3], etc.]

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
        const final_cell = target_cell[0] + y_sign
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
        const [cell_y, cell_x] = cell
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

function filterPossibleMovesToStayAwayFromOtherPlayersKing(cell, board, player_color, possible_moves){
    const threatened_cells = getCellsSurroundingEnemyKingIfItIsIn5x5RangeOfPlayerCell(cell, board, player_color)
    let filtered_moves = []

    if ((threatened_cells.length > 0) && (possible_moves.length > 0)){
        for (let possible_move of possible_moves){
            for (let threatened_cell of threatened_cells){
                const [yp, xp] = possible_move.cell
                const [yt, xt] = threatened_cell
                if ((yp !== yt) || (xp !== xt)){
                    filtered_moves.push(possible_move)
                }
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

function filterPossibleMovesForId(possible_moves, searched_id){
    return possible_moves.filter((possible_move) => {return (possible_move.piece?.id === searched_id)})
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

function getMoveFromListOfMoves(cell, possible_moves){
    for (let possible_move of possible_moves){
        if ((possible_move.cell[0] === cell[0]) && (possible_move.cell[1] === cell[1])){
            return possible_move
        }
    }
    return null
}

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

// (king vs. king & bishop) or (king vs. king & knight)
function isGameInDeadPositionThreePieces(live_white_pieces, live_black_pieces){
    const all_live_pieces = {...live_white_pieces, ...live_black_pieces}
    for (let piece_id in all_live_pieces){
        const piece_type = all_live_pieces[piece_id]?.type
        if ((piece_type === 'knight') || (piece_type === 'bishop')){
            return true
        }
    }
    return false
}

function isValueInInnerObjectContainedInObject(object, searched_property, searched_value){
    for (let key in object){
        const inner_object = object[key]
        if (inner_object[searched_property] === searched_value){
            return true
        }
    }
    return false
}

function getCellsContainingPiecesOfSpecifiedTypeFromBoard(type, board, max_amount){
    const cells = []
    for (let y = 0; y < 8; y++){
        for (let x = 0; x < 8; x++){
            const piece = board[y][x]
            if (piece?.type === type){
                cells.push([y, x])
                if (cells.length === max_amount){
                    return cells
                }
            }
        }
    }
    return cells
}

function areCellsOnSquaresOfSameColor(cell_1, cell_2){
    return (((cell_1[0] + cell_1[1]) % 2) === ((cell_2[0] + cell_2[1]) % 2))
}

// (king & bishop vs. king & bishop, with bishops on squares of same color)
function isGameInDeadPositionSameColorBishops(live_white_pieces, live_black_pieces, board){
    const is_white_bishop_alive = isValueInInnerObjectContainedInObject(live_white_pieces, 'type', 'bishop')
    const is_black_bishop_alive = isValueInInnerObjectContainedInObject(live_black_pieces, 'type', 'bishop')
    if (is_white_bishop_alive && is_black_bishop_alive){
        const [cell_bishop_1, cell_bishop_2] = getCellsContainingPiecesOfSpecifiedTypeFromBoard('bishop', board, 2)
        if (areCellsOnSquaresOfSameColor(cell_bishop_1, cell_bishop_2)){
            return true
        }
    }
    return false
}

function isGameInDeadPosition(live_white_pieces, live_black_pieces, board){
    const num_white_pieces = Object.keys(live_white_pieces).length
    const num_black_pieces = Object.keys(live_black_pieces).length

    if ((num_white_pieces <= 2) && (num_black_pieces <= 2)){
        if ((num_white_pieces === 1) && (num_black_pieces === 1)){
            return true // (king vs. king)
        } else if ((num_white_pieces === 1) || (num_black_pieces === 1)){
            if (isGameInDeadPositionThreePieces(live_white_pieces, live_black_pieces)){
                return true // (king vs. king & bishop) or (king vs. king & knight)
            }
        } else {
            if (isGameInDeadPositionSameColorBishops(live_white_pieces, live_black_pieces, board)){
                return true // (king & bishop vs. king & bishop, with bishops on squares of same color)
            }
        }
    }
    return false
}

function getNewPlay(selected_move, last_selected_cell, board, player_color){
    const last_selected_piece = board[last_selected_cell[0]][last_selected_cell[1]]
    let en_passant_capture = null
    let promotion = false
    let castling = null
    if (last_selected_piece?.type === 'pawn'){
        const en_passant_cell = selected_move?.en_passant_captured_cell
        if (en_passant_cell){
            const en_passant_piece = en_passant_cell ? board[en_passant_cell[0]][en_passant_cell[1]] : undefined
            en_passant_capture = { cell: en_passant_cell, piece: en_passant_piece }
        }
        const final_row = (player_color === 'white') ? 0 : 7
        if (selected_move.cell[0] === final_row){
            promotion = true
        }
    }
    const castling_side = selected_move?.castling
    if (castling_side){
        const x_pos = (castling_side === 'left') ? 0 : 7
        const rook = board[last_selected_cell[0]][x_pos]
        castling = { side: castling_side, piece: rook }
    }

    return new_play = {
        initial: {
            cell: last_selected_cell,
            piece: last_selected_piece
        },
        target: {
            cell: selected_move.cell,
            piece: selected_move.piece
        },
        en_passant_capture: en_passant_capture,
        promotion: promotion,
        castling: castling
    }
}

function getUpdatedBoard(new_play, board){
    let new_board = board
    if (new_play.castling){
        const king = new_play.initial.piece
        const rook = new_play.castling.piece
        const kings_row = new_play.initial.cell[0]
        const castling_side = new_play.castling.side
        if (castling_side === 'left'){
            new_board[kings_row][0] = null
            new_board[kings_row][2] = king
            new_board[kings_row][3] = rook
            new_board[kings_row][4] = null

        } else if (castling_side === 'right'){
            new_board[kings_row][7] = null
            new_board[kings_row][6] = king
            new_board[kings_row][5] = rook
            new_board[kings_row][4] = null
        }
    } else {
        const moved_piece = new_play.initial.piece
        const [initial_cell_y, initial_cell_x] = new_play.initial.cell
        const [target_cell_y, target_cell_x] = new_play.target.cell

        new_board[target_cell_y][target_cell_x] = moved_piece
        new_board[initial_cell_y][initial_cell_x] = null

        if (new_play.en_passant_capture){
            const [captured_cell_y, captured_cell_x] = new_play.en_passant_capture.cell
            new_board[captured_cell_y][captured_cell_x] = null
        }
    }
    return new_board
}

function getInstructionsForSelection(selected_cell, game, player_color){

    const instructions = []

    // part of board selected where there is no piece or highlighted cell to give location
    if ((selected_cell === null) || isOutOfBounds(selected_cell[1], selected_cell[0])){
        instructions.push({ action: 'updateSelection', params: { new_active_moves: [], new_last_selected_cell: null } })
        instructions.push({ action: 'deactivateBoard', params: null })

        return instructions
    }
    
    const player = game[player_color]
    const board = game.board
    const last_selected_cell = player.last_selected_cell
    const selected_piece = board[selected_cell[0]][selected_cell[1]]

    // if board isn't highlighted (first selection)
    if (!last_selected_cell){
        // if it's one of the players pieces
        if (player_color === selected_piece?.color){

            const new_active_moves = getPossibleMovesForSelection(selected_cell, board, player_color, player.king.cell)
            const new_last_selected_cell = selected_cell

            instructions.push({ action: 'updateSelection', params: { new_active_moves, new_last_selected_cell } })
            instructions.push({ action: 'activateBoard', params: { new_active_moves, new_last_selected_cell } })
        }
    // if board is highlighted (second selection)
    } else {
        const selected_move = getMoveFromListOfMoves(selected_cell, player.active_moves)
        // valid move
        if ((game.current_turn === player_color) && selected_move){

            const new_play = getNewPlay(selected_move, last_selected_cell, board, player_color)
            const new_board = getUpdatedBoard(new_play, board)

            instructions.push({ action: 'updateSelection', params: { new_active_moves: [], new_last_selected_cell: null } })
            instructions.push({ action: 'updateMove', params: { new_play, new_board } })
            instructions.push({ action: 'deactivateBoard', params: 'bothPlayers' })
            instructions.push({ action: 'movePiece', params: new_play })
            instructions.push({ action: 'checkIfGameOver', params: null })

        // other one of the players pieces selected
        } else if ((player_color === selected_piece?.color) && ((selected_cell[0] !== last_selected_cell[0]) || (selected_cell[1] !== last_selected_cell[1]))){

            const new_active_moves = getPossibleMovesForSelection(selected_cell, board, player_color, player.king.cell)
            const new_last_selected_cell = selected_cell

            instructions.push({ action: 'updateSelection', params: { new_active_moves, new_last_selected_cell } })
            instructions.push({ action: 'deactivateBoard', params: null })
            instructions.push({ action: 'activateBoard', params: { new_active_moves, new_last_selected_cell } })

        } else {

            instructions.push({ action: 'updateSelection', params: { new_active_moves: [], new_last_selected_cell: null } })
            instructions.push({ action: 'deactivateBoard', params: null })
        }
    }

    return instructions
}

function getGameOverState(game, player_color){
    const board = game.board
    const enemy_color = (player_color === 'white') ? 'black' : 'white'
    const enemy_kings_cell = game[enemy_color].king.cell
    const threats_to_enemy_king = getPiecesThreateningKing(board, enemy_color, enemy_kings_cell)
    const is_enemy_king_in_check = (threats_to_enemy_king.length > 0)

    if (isPlayerInCheckmate(board, enemy_color, enemy_kings_cell, threats_to_enemy_king)){
        return 'checkmate' //player_color won
    }
    if (isPlayerInStalemate(board, enemy_color, enemy_kings_cell, is_enemy_king_in_check)){
        return 'stalemate'
    }
    if (isGameInDeadPosition(game.white.pieces_alive, game.black.pieces_alive, board)){
        return 'deadPosition'
    }
    return null
}

module.exports = {
    getInstructionsForSelection,
    getGameOverState
}
