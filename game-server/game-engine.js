
const { isOutOfBounds } = require('./move-evaluation')
const { getPiecesThreateningKing } = require('./moves-&-threats')
const { getPossibleMovesForSelection } = require('./possible-moves-for-selection')
const { isPlayerInCheckmate } = require('./checkmate')
const { isPlayerInStalemate } = require('./stalemate')
const { isGameInDeadPosition } = require('./dead-position')

// White Pieces: Kw, Qw, Rw, Bw, Nw, pw
// Black Pieces: Kb, Qb, Rb, Bb, Nb, pb
// Free Tile (Piece): null

// selected_cell: [row, col]
// board: [[row1], [row2], [row3], etc.]
// row: [[piece1], [piece2], [piece3], etc.]
// move: {cell: [row, col], piece: object}

function getMoveFromListOfMoves(cell, possible_moves){
    for (let possible_move of possible_moves){
        if ((possible_move.cell[0] === cell[0]) && (possible_move.cell[1] === cell[1])){
            return possible_move
        }
    }
    return null
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
