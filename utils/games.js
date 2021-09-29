const createPiece = require('./pieces')

const active_games = {}

function getGame(id){
    return active_games[id]
}

function createGame(player_id){

    const game = {}

    // create white pieces
    const Kw = createPiece('king', 'white', 'Kw')
    const Qw = createPiece('queen', 'white', 'Qw')
    const Rwl = createPiece('rook', 'white', 'Rwl')
    const Rwr = createPiece('rook', 'white', 'Rwr')
    const Bwl = createPiece('bishop', 'white', 'Bwl')
    const Bwr = createPiece('bishop', 'white', 'Bwr')
    const Nwl = createPiece('knight', 'white', 'Nwl')
    const Nwr = createPiece('knight', 'white', 'Nwr')
    const pw1 = createPiece('pawn', 'white', 'pw1')
    const pw2 = createPiece('pawn', 'white', 'pw2')
    const pw3 = createPiece('pawn', 'white', 'pw3')
    const pw4 = createPiece('pawn', 'white', 'pw4')
    const pw5 = createPiece('pawn', 'white', 'pw5')
    const pw6 = createPiece('pawn', 'white', 'pw6')
    const pw7 = createPiece('pawn', 'white', 'pw7')
    const pw8 = createPiece('pawn', 'white', 'pw8')

    // create black pieces
    const Kb = createPiece('king', 'black', 'Kb')
    const Qb = createPiece('queen', 'black', 'Qb')
    const Rbl = createPiece('rook', 'black', 'Rbl')
    const Rbr = createPiece('rook', 'black', 'Rbr')
    const Bbl = createPiece('bishop', 'black', 'Bbl')
    const Bbr = createPiece('bishop', 'black', 'Bbr')
    const Nbl = createPiece('knight', 'black', 'Nbl')
    const Nbr = createPiece('knight', 'black', 'Nbr')
    const pb1 = createPiece('pawn', 'black', 'pb1')
    const pb2 = createPiece('pawn', 'black', 'pb2')
    const pb3 = createPiece('pawn', 'black', 'pb3')
    const pb4 = createPiece('pawn', 'black', 'pb4')
    const pb5 = createPiece('pawn', 'black', 'pb5')
    const pb6 = createPiece('pawn', 'black', 'pb6')
    const pb7 = createPiece('pawn', 'black', 'pb7')
    const pb8 = createPiece('pawn', 'black', 'pb8')

    // pieces names are used only in this module. IDs (third argument) are used in rest of front-end and back-end

    game.board = [[Rbl, Nbl, Bbl, Qb, Kb, Bbr, Nbr, Rbr], 
    [pb1, pb2, pb3, pb4, pb5, pb6, pb7, pb8], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null], 
    [pw1, pw2, pw3, pw4, pw5, pw6, pw7, pw8], 
    [Rwl, Nwl, Bwl, Qw, Kw, Bwr, Nwr, Rwr]]

    // FOR TESTING:
    /* game.board = [[Rbl, null, null, null, Kb, null, null, Rbr], 
    [pb1, pb2, pb3, pb4, pb5, pb6, pb7, pb8], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null], 
    [pw1, pw2, pw3, pw4, pw5, pw6, pw7, pw8], 
    [Rwl, null, null, null, Kw, null, null, Rwr]] */

    function createPiecesObject(pieces_array){
        const pieces_object = {}
        pieces_array.forEach((piece) => {pieces_object[piece.id] = piece})
        return pieces_object
    }

    game.white = {
        king: Kw,
        double_moved_pawn: null,
        promotion_cell: null,
        pieces_alive: createPiecesObject([Kw, Qw, Rwl, Rwr, Bwl, Bwr, Nwl, Nwr, pw1, pw2, pw3, pw4, pw5, pw6, pw7, pw8]),
        pieces_captured: [],
        last_selected_cell: null,
        active_moves: []
    }
    game.black = {
        king: Kb,
        double_moved_pawn: null,
        promotion_cell: null,
        pieces_alive: createPiecesObject([Kb, Qb, Rbl, Rbr, Bbl, Bbr, Nbl, Nbr, pb1, pb2, pb3, pb4, pb5, pb6, pb7, pb8]),
        pieces_captured: [],
        last_selected_cell: null,
        active_moves: []
    }

    game.past_plays_list = []
    game.current_turn = 'white'
    game.id = player_id
    
    active_games[player_id] = game

}

function deleteGame(id){
    delete active_games[id]
}

function updateGameSelection(game_id, player_color, new_active_moves, new_last_selected_cell){
    const game = getGame(game_id)
    const player = game[player_color]

    player.active_moves = new_active_moves
    player.last_selected_cell = new_last_selected_cell
}

function updateGameMove(game_id, player_color, new_play, new_board){
    const game = getGame(game_id)
    const enemy_color = (player_color === 'white') ? 'black' : 'white'
    const player = game[player_color]
    const enemy = game[enemy_color]
    const moved_piece = new_play.initial.piece

    game.board = new_board
    game.past_plays_list.push(new_play)

    if (player.double_moved_pawn){
        player.double_moved_pawn.has_moved_double = false
    }
    player.double_moved_pawn = null

    if (!new_play.promotion){
        game.current_turn = enemy_color
    } else {
        player.promotion_cell = new_play.target.cell
    }

    if ((new_play.target.piece !== null) || (new_play.en_passant_capture)){
        const capured_piece_id = new_play.target.piece?.id || new_play.en_passant_capture?.piece.id

        player.pieces_captured.push(capured_piece_id)
        delete enemy.pieces_alive[capured_piece_id]
    }

    if ((moved_piece.type === 'king') || (moved_piece.type === 'rook')){
        player.pieces_alive[moved_piece.id].has_not_moved = false

        if (moved_piece.type === 'king'){
            player.king.cell = new_play.target.cell
        }
    }

    if (moved_piece.type === 'pawn'){
        const num_cells_pawn_has_advanced = Math.abs(new_play.initial.cell[0] - new_play.target.cell[0])
        if (num_cells_pawn_has_advanced === 2){
            player.double_moved_pawn = player.pieces_alive[moved_piece.id]
            player.double_moved_pawn.has_moved_double = true
        }
    }
}

function getPawnEligibleForPromotion(game_id, player_color){
    const game = getGame(game_id)
    const player = game[player_color]
    if (player.promotion_cell){
        const [y, x] = player.promotion_cell
        const pawn = game.board[y][x]
        return pawn
    } else {
        return null
    }
}

// Note: this function updates the game database AND returns a value
function promotePawnAndReturnIt(game_id, player_color, promotion_type){
    const game = getGame(game_id)
    const player = game[player_color]
    const enemy_color = (player_color === 'white') ? 'black' : 'white'

    if (player.promotion_cell === null){
        return null
    }

    const [y, x] = player.promotion_cell
    const pawn_id = game.board[y][x].id

    const id_types = { queen: 'Q', rook: 'R', bishop: 'B', knight: 'N' }
    const id_type = id_types[promotion_type]
    const promotion_id = `${id_type}${player_color[0]}${pawn_id[2]}`

    const promoted_pawn = createPiece(promotion_type, player_color, promotion_id)
    game.board[y][x] = promoted_pawn

    player.promotion_cell = null
    game.current_turn = enemy_color

    return promoted_pawn
}

module.exports = {
    getGame,
    createGame,
    deleteGame,
    updateGameSelection,
    updateGameMove,
    getPawnEligibleForPromotion,
    promotePawnAndReturnIt
}