// modulate and comment front-end
// comment back-end
// schema

const socket = io();

let requesting_opponent_g = null
let player_color_g = null
let move_counter_g = 1

// syntactic sugar
function getElement(selectors){
    return document.querySelector(selectors)
}

function generateRandomColor(){
    const color = (Math.random() < 0.5) ? 'white' : 'black'
    return color
}

const board_element = getElement('#board')
const opponent_info = getElement('#opponent-info')
const player_info = getElement('#player-info')
const opponent_name = getElement('#opponent-info .name')
const player_name = getElement('#player-info .name')
let opponent_captured_pieces = getElement('#opponent-info .captured-pieces')
let player_captured_pieces = getElement('#player-info .captured-pieces')
const move_table = getElement('#move-table')
let move_table_content = getElement('.move-table-content')
const board_overlay = getElement('.overlay')
const board_alert = getElement('#board-alert-box')
const board_alert_title = getElement('#board-alert-box .title')
const board_alert_content = getElement('#board-alert-box .content')
const board_alert_join_btn = getElement('#board-alert-box .join-btn')
const board_alert_ignore_btn = getElement('#board-alert-box .ignore-btn')
const board_alert_cancel_btn = getElement('#board-alert-box .cancel-btn')
const board_alert_promotion_btns = getElement('#promotion-btns')
const board_alert_close_btn = getElement('#board-alert-box .close-btn')
const board_alert_confirm_resign_btn = getElement('#board-alert-box .confirm-resign-btn')
const board_alert_accept_draw_btn = getElement('#board-alert-box .accept-draw-btn')
const board_alert_deny_draw_btn = getElement('#board-alert-box .deny-draw-btn')
const promotion_type_knight_btn = getElement('#promotion-type-knight-btn')
const promotion_type_bishop_btn = getElement('#promotion-type-bishop-btn')
const promotion_type_rook_btn = getElement('#promotion-type-rook-btn')
const promotion_type_queen_btn = getElement('#promotion-type-queen-btn')
const user_data = getElement('.user-data')
const quick_game_btn = getElement('#quick-game-btn')
const quick_game_options = getElement('#quick-game-options')
const quick_game_input = getElement('#quick-game-input')
const quick_game_input_alert = getElement('#quick-game-input-alert')
const quick_game_input_btn = getElement('#quick-game-input-btn')
const quick_game_random_btn = getElement('#quick-game-random-btn')
const log_out_btn = getElement('#log-out-btn')
const log_out_options = getElement('#log-out-options')
const log_out_confirm_btn = getElement('#log-out-confirm-btn')
const new_game_btn = getElement('#new-game-btn')
const new_game_options = getElement('#new-game-options')
const join_game_btn = getElement('#join-game-btn')
const join_game_options = getElement('#join-game-options')
const join_game_input = getElement('#join-game-input')
const join_game_input_alert = getElement('#join-game-input-alert')
const join_game_input_btn = getElement('#join-game-input-btn')
const random_opponent_btn = getElement('#random-opponent-btn')
const random_opponent_options = getElement('#random-opponent-options')
const random_opponent_alert = getElement('#random-opponent-alert')
const resign_btn = getElement('#resign-btn')
const draw_btn = getElement('#draw-btn')
const slide_from_left = document.querySelectorAll('.slide-left')
const slide_from_right = document.querySelectorAll('.slide-right')

const logged_out_elements = [quick_game_btn]
const logged_in_elements = [log_out_btn, new_game_btn, join_game_btn, random_opponent_btn]
const sidebar_toggle_elements = [quick_game_options, new_game_options, join_game_options, log_out_options, random_opponent_options, quick_game_input_alert, join_game_input_alert]




// SLIDE IN OF ELEMENTS FROM SIDES:

slide_from_left.forEach((element) => {element.classList.add('appear')})
slide_from_right.forEach((element) => {element.classList.add('appear')})




// OPENING AND CLOSING OF VISUAL OPTION ELEMENTS (PURELY AESTHETIC):

function hideElements(elem_list){
    for (let elem of elem_list){
        elem.classList.add('hidden')
    }
}

function showElements(elem_list){
    for (let elem of elem_list){
        elem.classList.remove('hidden')
    }
}

function toggleHideOrShow(elem){
    if (elem.classList.contains('hidden')){
        elem.classList.remove('hidden')
    } else {
        elem.classList.add('hidden')
    }
}

function hideAllToggleElementsExceptEspecified(elem_kept){
    const elem_kept_id = elem_kept.id
    for (let elem of sidebar_toggle_elements){
        if (elem.id !== elem_kept_id){
            elem.classList.add('hidden')
        }
    }
}

function hideAllToggleElements(){
    for (let elem of sidebar_toggle_elements){
        elem.classList.add('hidden')
    }
}

function updateLeftSidebarToLogIn(username){
    user_data.textContent = username
    toggleHideOrShow(quick_game_options)
    hideElements(logged_out_elements)
    showElements(logged_in_elements)
}

function updateLeftSidebarToLogOut(){
    user_data.textContent = " "
    toggleHideOrShow(log_out_options)
    hideElements(logged_in_elements)
    showElements(logged_out_elements)
}

quick_game_btn.addEventListener('click', () => {
    toggleHideOrShow(quick_game_options)
    hideAllToggleElementsExceptEspecified(quick_game_options)
})

log_out_btn.addEventListener('click', () => {
    toggleHideOrShow(log_out_options)
    hideAllToggleElementsExceptEspecified(log_out_options)
})

new_game_btn.addEventListener('click', () => {
    toggleHideOrShow(new_game_options)
    hideAllToggleElementsExceptEspecified(new_game_options)
})

join_game_btn.addEventListener('click', () => {
    toggleHideOrShow(join_game_options)
    hideAllToggleElementsExceptEspecified(join_game_options)
})




// FUNCTIONS FOR OPENING AND CLOSING FUNCTIONAL ELEMENTS:

// 'special_btns' may be 'join', 'cancel', 'promotion', 'resign', 'draw'
function openBoardAlertPopup(title, content, special_btns = null){
    board_alert.classList.remove('hidden')
    board_alert_title.textContent = title
    board_alert_content.textContent = content
    board_overlay.classList.remove('hidden')
    board_overlay.classList.add('overlay-show')

    if (special_btns === 'join'){
        board_alert_join_btn.classList.remove('hidden')
        board_alert_ignore_btn.classList.remove('hidden')
    } else if (special_btns === 'cancel'){
        board_alert_cancel_btn.classList.remove('hidden')
    } else if (special_btns === 'promotion'){
        board_alert_promotion_btns.classList.remove('hidden')
        board_alert_close_btn.classList.add('hidden')
    } else if (special_btns === 'resign'){
        board_alert_confirm_resign_btn.classList.remove('hidden')
    } else if (special_btns === 'draw'){
        board_alert_accept_draw_btn.classList.remove('hidden')
        board_alert_deny_draw_btn.classList.remove('hidden')
    }

    board_element.scrollIntoView(false)
}

function closeBoardAlertPopup(){
    board_overlay.classList.add('hidden')
    board_overlay.classList.remove('overlay-show')
    board_alert.classList.add('hidden')
    board_alert_join_btn.classList.add('hidden')
    board_alert_ignore_btn.classList.add('hidden')
    board_alert_cancel_btn.classList.add('hidden')
    board_alert_promotion_btns.classList.add('hidden')
    board_alert_confirm_resign_btn.classList.add('hidden')
    board_alert_accept_draw_btn.classList.add('hidden')
    board_alert_deny_draw_btn.classList.add('hidden')
}

function openQuickGameAlert(message){
    quick_game_input_alert.classList.remove('hidden')
    quick_game_input_alert.textContent = message
}

function closeQuickGameAlert(){
    quick_game_input_alert.classList.add('hidden')
}

function openJoinGameAlert(message){
    join_game_input_alert.classList.remove('hidden')
    join_game_input_alert.textContent = message
}

function closeJoinGameAlert(){
    join_game_input_alert.classList.add('hidden')
}

function openRandomOpponentAlert(message){
    random_opponent_options.classList.remove('hidden')
    random_opponent_alert.textContent = message
}

function closeRandomOpponentAlert(){
    random_opponent_options.classList.add('hidden')
}




// BOARD CREATION FUNCTIONS:

function addImageSourceToPieceElement(piece_elem, piece_color, piece_type){
    piece_elem.src = `../images/pieces/${piece_color}-${piece_type}.png`
}

function positionElementOnBoard(element, x_position, y_position, player_color){
    const x_pos = (player_color === 'white') ? (x_position * 12.5) : ((7 - x_position) * 12.5)
    const y_pos = (player_color === 'white') ? (y_position * 12.5) : ((7 - y_position) * 12.5)
    element.style.left = `${x_pos}%`
    element.style.top = `${y_pos}%`
}

function createPieceElement(piece, x, y, player_color){
    const piece_elem = document.createElement('img')

    piece_elem.id = piece.id
    addImageSourceToPieceElement(piece_elem, piece.color, piece.type)
    piece_elem.classList.add('piece')
    positionElementOnBoard(piece_elem, x, y, player_color)

    return piece_elem
}

function createBoard(board, player_color){
    const piece_container = document.createElement('div')
    piece_container.classList.add('board-piece-container')
    board_element.appendChild(piece_container)

    board_element.style.backgroundImage = `url(../images/checkered-board-${player_color}.svg)`

    for (let y = 0; y < 8; y++){
        for (let x = 0; x < 8; x++){
            const piece = board[y][x]
            if (piece !== null){
                const piece_elem = createPieceElement(piece, x, y, player_color)
                piece_container.appendChild(piece_elem)
            }
        }
    }
}




// BOARD DELETION FUNCTIONS:

function removeElement(element_identifier){
    const element = getElement(element_identifier)
    if (element){
        element.remove()
    }
}

function deactivateBoard(){
    removeElement('.board-highlight-container')
}

function deletePiecesFromBoard(){
    removeElement('.board-piece-container')
}

function recreateDivElement(element_to_delete, element_class, parent_element){
    parent_element.removeChild(element_to_delete)

    const new_element = document.createElement('div')
    new_element.classList.add(element_class)
    parent_element.appendChild(new_element)
}

function deletePiecesFromCapturedPiecesContainers(){
    recreateDivElement(opponent_captured_pieces, 'captured-pieces', opponent_info)
    recreateDivElement(player_captured_pieces, 'captured-pieces', player_info)
    opponent_captured_pieces = getElement('#opponent-info .captured-pieces')
    player_captured_pieces = getElement('#player-info .captured-pieces')
}

function deleteLastMovesFromTable(){
    recreateDivElement(move_table_content, 'move-table-content', move_table)
    move_table_content = getElement('.move-table-content')
}

// clear all game data on front end
function clearGameData(){
    deactivateBoard()
    deletePiecesFromBoard()
    deletePiecesFromCapturedPiecesContainers()
    deleteLastMovesFromTable()
    board_element.style.backgroundImage = 'url(../images/checkered-board.svg)'
    opponent_name.textContent = ""
    opponent_info.classList.add('hidden')
}




// PLAYER CREATION AND DELETION, AND GAME CREATION AND JOINING:

quick_game_input_btn.addEventListener('click', () => {
    const proposed_username = quick_game_input.value
    const name_length = proposed_username.length

    if (name_length < 6 || name_length > 18){
        openQuickGameAlert("Please choose a username between 6 and 18 characters long, or click on random")
    } else {
        closeQuickGameAlert()
        socket.emit('createPlayer', proposed_username)
    }
})

quick_game_random_btn.addEventListener('click', () => {
    socket.emit('createPlayer', 'random')
})

socket.on('logInSuccessful', (username) => { // temporarily on playerCreated
    updateLeftSidebarToLogIn(username)
    player_name.textContent = username
    player_info.classList.remove('hidden')

    const title = `Successfully logged in as: ${username}!`
    const text = "To begin playing, create a New Game, Join a friends Game or Find a Random Opponent in the menu to the left."
    openBoardAlertPopup(title, text)
})

socket.on('playerCreationError', (error) => {
    openQuickGameAlert(error)
})

log_out_confirm_btn.addEventListener('click', () => {
    socket.emit('deletePlayer') // temporary, should be logPlayerOut
})

socket.on('logOutSuccessful', () => { // temporarily on playerDeleted
    updateLeftSidebarToLogOut()
    clearGameData()
    player_name.textContent = ""
    player_info.classList.add('hidden')

    const title = "Successfully logged out."
    const text = "To play again, press Log-in in the left menu: pick a username or press Random Name for an automated one."
    openBoardAlertPopup(title, text)
})

new_game_options.addEventListener('click', (event) => {
    const elem_id = event.target.id
    const possible_colors = {'new-game-color-white': 'white', 'new-game-color-random': generateRandomColor(), 'new-game-color-black': 'black'}
    
    const color = possible_colors[elem_id]
    if (color){
        socket.emit('createGame', color)
    }
})

socket.on('newGameCreated', ([board, player_color]) => {
    clearGameData()
    createBoard(board, player_color)
    player_color_g = player_color

    const title = "New game created!"
    const text = "Ask a friend to Join your game by using your Username or click on 'Find Random Opponent' to be matched with a random player."
    openBoardAlertPopup(title, text)
    hideAllToggleElements()
})

join_game_input_btn.addEventListener('click', () => {
    const opponents_username = join_game_input.value
    const name_length = opponents_username.length
    
    if (name_length < 6 || name_length > 18){
        openJoinGameAlert("Please place a username between 6 and 18 characters long")
    } else {
        openJoinGameAlert("Waiting for player to respond...")
        socket.emit('joinGame', opponents_username) // server also has socket.id
    }
})

socket.on('joinGameRequest', (opponent_username) => {
    requesting_opponent_g = opponent_username
    
    const title = "Join Request"
    const text = `Player ${opponent_username} would like to join your game; would you like to accept?`
    openBoardAlertPopup(title, text, 'join')
})

function confirmJoinRequest(){
    socket.emit('confirmJoin', requesting_opponent_g)
    closeBoardAlertPopup()
}

function ignoreJoinRequest(){
    socket.emit('ignoreJoin', requesting_opponent_g)
    closeBoardAlertPopup()
}

board_alert_join_btn.addEventListener('click', () => {
    confirmJoinRequest()
})

board_alert_ignore_btn.addEventListener('click', () => {
    ignoreJoinRequest()
})

socket.on('newGameJoined', ([board, player_color]) => {
    clearGameData()
    createBoard(board, player_color)
    closeJoinGameAlert()
    closeRandomOpponentAlert()
    player_color_g = player_color

    const title = "Joined new game!"
    const text = "Close this window to begin playing."
    openBoardAlertPopup(title, text)
})

// gets sent to both players
socket.on('joinGameSuccessful', (opponent_username) => {
    opponent_name.textContent = opponent_username
    opponent_info.classList.remove('hidden')
    socket.emit('cacheOpponentAndGame')
    hideAllToggleElements()
})

socket.on('joinGameError', (error) => {
    openJoinGameAlert(error)
})

random_opponent_btn.addEventListener('click', () => {
    const color = generateRandomColor()
    openRandomOpponentAlert("Finding opponent...")
    socket.emit('randomGame', color)
})




// GAME INTERACTION MESSAGES:

function cancelCurrentGame(){
    socket.emit('confirmCancel')
    clearGameData()
}

socket.on('clearCache', () => {
    player_color_g = null
    requesting_opponent_g = null
    move_counter_g = 1
    socket.emit('clearCacheOfOpponentAndGame')
})

board_alert_close_btn.addEventListener('click', () => {
    if (board_alert_title.textContent === "Join Request"){
        ignoreJoinRequest()
    } else {
        closeBoardAlertPopup()
    }
})

socket.on('askIfCancelCurrentGame', () => {
    const title = "Cancel current game?"
    const text = "This action will cancel the current game."
    openBoardAlertPopup(title, text, 'cancel')
})

board_alert_cancel_btn.addEventListener('click', () => {
    cancelCurrentGame()
    closeBoardAlertPopup()
})

resign_btn.addEventListener('click', () => {
    const title = "Resign"
    const text = "Are you sure you would like to resign?"
    openBoardAlertPopup(title, text, 'resign')
})

board_alert_confirm_resign_btn.addEventListener('click', () => {
    socket.emit('resign')
    cancelCurrentGame()
    closeBoardAlertPopup()

    const score = (player_color_g === 'white') ? '0-1' : '1-0'
    createNewMoveTableItem(score)
})

socket.on('opponentResigned', () => {
    const title = "Game won!!! Opponent resigned!"
    openBoardAlertPopupForFinishedGame(title)

    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
})

draw_btn.addEventListener('click', () => {
    socket.emit('drawRequest')
})

socket.on('opponentDrawRequest', (opponent_username) => {
    const title = `${opponent_username} is requesting to draw the game`
    const text = "Would you like to accept?"
    openBoardAlertPopup(title, text, 'draw')
})

board_alert_accept_draw_btn.addEventListener('click', () => {
    socket.emit('drawRequestAccepted')
    closeBoardAlertPopup()
})

board_alert_deny_draw_btn.addEventListener('click', () => {
    socket.emit('drawRequestDenied')
    closeBoardAlertPopup()
})

socket.on('gameDrawn', () => {
    const title = "Draw by mutual agreement!"
    openBoardAlertPopupForFinishedGame(title)

    createNewMoveTableItem('½–½')
})

socket.on('informDeniedDrawRequest', () => {
    const title = "Draw request was denied by opponent"
    const text = "Close this window to continue playing"
    openBoardAlertPopup(title, text)
})




// FINISHED GAME MESSAGES:

function openBoardAlertPopupForFinishedGame(title){
    const text = "To play again, create a New Game, Join a friends Game or Find a Random Opponent in the menu to the left"
    openBoardAlertPopup(title, text)
}

socket.on('gameCancelledByOpponent', () => {
    const title = "Game cancelled by opponent :("
    openBoardAlertPopupForFinishedGame(title)

    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
})

socket.on('opponentLoggedOut', () => {
    const title = "Opponent Logged Out :("
    openBoardAlertPopupForFinishedGame(title)

    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
})

socket.on('gameOverByCheckmateWon', () => {
    const title = "Game won by checkmate!!!"
    openBoardAlertPopupForFinishedGame(title)
    
    createNewMoveTableItem('#')
    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
})

socket.on('gameOverByCheckmateLost', () => {
    const title = "Game Over, lost by checkmate :("
    openBoardAlertPopupForFinishedGame(title)

    createNewMoveTableItem('#')
    const score = (player_color_g === 'white') ? '0-1' : '1-0'
    createNewMoveTableItem(score)
})

socket.on('gameOverByStalemate', () => {
    const title = "Draw by stalemate"
    openBoardAlertPopupForFinishedGame(title)

    createNewMoveTableItem('½–½')
})

socket.on('gameOverByDeadPosition', () => {
    const title = "Draw by dead position"
    openBoardAlertPopupForFinishedGame(title)

    createNewMoveTableItem('½–½')
})




// GAME:

function multiplyStringNumberBy10(num_string_1){
    let num_string_2
    if (num_string_1.slice(-2,-1) === '.'){
        num_string_2 = num_string_1.replace('.','')
    } else {
        num_string_2 = num_string_1 + '0'
    }
    return num_string_2
}

function getPositionFromElement(element){
    const x_string = element.style.left.slice(0, -1)
    const y_string = element.style.top.slice(0, -1)

    const x_pos = parseInt(multiplyStringNumberBy10(x_string)) / 125
    const y_pos = parseInt(multiplyStringNumberBy10(y_string)) / 125

    return cell = [y_pos, x_pos]
}

board_element.addEventListener('click', (event) => {
    const clicked_element = event.target
    let selected_cell
    if (clicked_element.classList.contains('piece') || clicked_element.classList.contains('highlighted-cell')){
        const [y, x] = getPositionFromElement(clicked_element)
        selected_cell = (player_color_g === 'white') ? [y, x] : [(7 - y), (7 - x)]
    } else {
        selected_cell = null
    }
    socket.emit('selectionMade', selected_cell)
})

function getHighlightedCellDiv(cell, highlight_class, player_color){
    const [y, x] = cell
    const highlighted_cell = document.createElement('div')

    highlighted_cell.classList.add(highlight_class)
    positionElementOnBoard(highlighted_cell, x, y, player_color)

    return highlighted_cell
}

socket.on('activateBoard', ([new_active_moves, new_last_selected_cell, player_color]) => {
    const highlight_container = document.createElement('div')
    highlight_container.classList.add('board-highlight-container')
    board_element.appendChild(highlight_container)
    
    for (let new_move of new_active_moves){
        const highlighted_cell = getHighlightedCellDiv(new_move.cell, 'highlighted-cell', player_color)
        highlight_container.appendChild(highlighted_cell)
    }
    const selected_cell = getHighlightedCellDiv(new_last_selected_cell, 'selected-cell', player_color)
    highlight_container.appendChild(selected_cell)
})

socket.on('deactivateBoard', () => {
    deactivateBoard()
})

function askForPromotionType(player_color){
    promotion_type_knight_btn.classList.add(`background-${player_color}-knight`)
    promotion_type_bishop_btn.classList.add(`background-${player_color}-bishop`)
    promotion_type_rook_btn.classList.add(`background-${player_color}-rook`)
    promotion_type_queen_btn.classList.add(`background-${player_color}-queen`)

    const title = "Choose a piece to promote pawn to:"
    openBoardAlertPopup(title, "", 'promotion')
}

function highlightPromotionCell(cell, player_color){
    const piece_container = getElement('.board-piece-container')
    const promotion_cell = getHighlightedCellDiv(cell, 'promoted-cell', player_color)
    piece_container.appendChild(promotion_cell)
}

function getPieceElement(piece){
    return document.getElementById(piece.id)
}

function removeCapturedPieceFromBoard(captured_piece, player_color){
    const captured_piece_elem = getPieceElement(captured_piece)
    captured_piece_elem.classList.add('captured-piece')
    captured_piece_elem.classList.remove('piece')

    if (captured_piece.color === player_color){
        opponent_captured_pieces.appendChild(captured_piece_elem)
    } else {
        player_captured_pieces.appendChild(captured_piece_elem)
    }
}

const piece_names = {
    king: 'K',
    queen: 'Q',
    rook: 'R',
    bishop: 'B',
    knight: 'N',
    pawn: ''
}
const board_files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const board_ranks = (cell_y) => {return String(8 - cell_y)}

function getMoveInNotation(new_play){

    if (new_play.castling !== null){
        const castling_move_in_notation = (new_play.castling.side === 'left') ? '0-0-0' : '0-0'
        return castling_move_in_notation
    }

    let move_in_notation = ''
    move_in_notation += piece_names[new_play.initial.piece.type]
    move_in_notation += board_files[new_play.initial.cell[1]]
    move_in_notation += board_ranks(new_play.initial.cell[0])

    if (new_play.target.piece === null){
        move_in_notation += '-'
    } else {
        move_in_notation += 'x'
    }

    move_in_notation += board_files[new_play.target.cell[1]]
    move_in_notation += board_ranks(new_play.target.cell[0])

    if (new_play.en_passant_capture !== null){
        move_in_notation += ' e.p.'
    }

    return move_in_notation
}

function createNewMoveTableItem(move_table_item_text){
    let new_move_table_item_text = ''
    new_move_table_item_text += String(move_counter_g)
    new_move_table_item_text += '.    '
    new_move_table_item_text += move_table_item_text
    move_counter_g += 1

    const new_move_table_item = document.createElement('div')
    new_move_table_item.classList.add('move-table-item')
    new_move_table_item.textContent = new_move_table_item_text
    move_table_content.appendChild(new_move_table_item)

    new_move_table_item.scrollIntoView(false)
}

function appendTextToLastNewMoveTableItem(move_table_item_text){
    const all_items = document.querySelectorAll('.move-table-item')
    const last_move_table_item = all_items[all_items.length-1]

    let last_move_table_item_text = last_move_table_item.textContent
    last_move_table_item_text += move_table_item_text
    last_move_table_item.textContent = last_move_table_item_text

    last_move_table_item.scrollIntoView(false)
}

function updateLastMoves(new_play){
    const move_table_item_text = getMoveInNotation(new_play)
    if (new_play.initial.piece.color === 'white'){
        createNewMoveTableItem(move_table_item_text)
    } else {
        appendTextToLastNewMoveTableItem('    ')
        appendTextToLastNewMoveTableItem(move_table_item_text)
    }
}

socket.on('movePiece', ([new_play, player_color]) => {
    const moved_piece = new_play.initial.piece
    const target_cell = new_play.target.cell
    const captured_piece = new_play.target.piece

    const moved_piece_elem = getPieceElement(moved_piece)
    positionElementOnBoard(moved_piece_elem, target_cell[1], target_cell[0], player_color)

    updateLastMoves(new_play)

    if (captured_piece){
        removeCapturedPieceFromBoard(captured_piece, player_color)
    }
    if (new_play.en_passant_capture){
        removeCapturedPieceFromBoard(new_play.en_passant_capture.piece, player_color)
    }
    if (new_play.castling){
        const moved_rook_elem = getPieceElement(new_play.castling.piece)
        const x_pos = (new_play.castling.side === 'left') ? 3 : 5
        positionElementOnBoard(moved_rook_elem, x_pos, target_cell[0], player_color)
    }
    if (new_play.promotion && (moved_piece.color === player_color)){
        highlightPromotionCell(target_cell, player_color)
        askForPromotionType(player_color)
    }
})

board_alert_promotion_btns.addEventListener('click', (event) => {
    const elem_id = event.target.id
    const possible_types = {'promotion-type-knight-btn': 'knight', 'promotion-type-bishop-btn': 'bishop', 'promotion-type-rook-btn': 'rook', 'promotion-type-queen-btn': 'queen'}
    
    const type = possible_types[elem_id]
    if (type){
        socket.emit('pawnPromotionTypeChosen', type)
        board_alert_close_btn.classList.remove('hidden')
        closeBoardAlertPopup()
    }
})

socket.on('promotePawn', ([unpromoted_pawn, promoted_pawn]) => {
    const pawn_element = getPieceElement(unpromoted_pawn)
    pawn_element.id = promoted_pawn.id
    addImageSourceToPieceElement(pawn_element, promoted_pawn.color, promoted_pawn.type)

    const pawnPromotionTypeNotation = piece_names[promoted_pawn.type]
    appendTextToLastNewMoveTableItem(pawnPromotionTypeNotation)
})
