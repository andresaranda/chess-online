// modulate and comment front-end
// comment back-end

const socket = io();

let requesting_opponent_g = null
let player_color_g = null
let move_counter_g = 1
let is_ai_game_g = false
let is_ai_thinking_g = false
let is_seeking_random_g = false
let is_waiting_join_g = false
let current_turn_g = 'white'
let pending_join_target_g = new URLSearchParams(window.location.search).get('join')
let pending_share_url_g = null

// syntactic sugar
function getElement(selectors){
    return document.querySelector(selectors)
}

function generateRandomColor(){
    const color = (Math.random() < 0.5) ? 'white' : 'black'
    return color
}

socket.on('consoleLogError', (error) => { console.log(error) })

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
const board_alert_cancel_search_btn = getElement('#board-alert-box .cancel-search-btn')
const board_alert_cancel_join_btn = getElement('#board-alert-box .cancel-join-btn')
const board_alert_promotion_btns = getElement('#promotion-btns')
const board_alert_close_btn = getElement('#board-alert-box .close-btn')
const board_alert_ok_btn = getElement('#board-alert-box .ok-btn')
const board_alert_copy_link_btn = getElement('#board-alert-box .copy-link-btn')
const board_alert_confirm_resign_btn = getElement('#board-alert-box .confirm-resign-btn')
const board_alert_accept_draw_btn = getElement('#board-alert-box .accept-draw-btn')
const board_alert_deny_draw_btn = getElement('#board-alert-box .deny-draw-btn')
const promotion_type_knight_btn = getElement('#promotion-type-knight-btn')
const promotion_type_bishop_btn = getElement('#promotion-type-bishop-btn')
const promotion_type_rook_btn = getElement('#promotion-type-rook-btn')
const promotion_type_queen_btn = getElement('#promotion-type-queen-btn')
const user_data = getElement('.user-data')
const user_data_name = getElement('.user-data-name')
const player_turn_indicator = getElement('#player-info .turn-indicator')
const opponent_turn_indicator = getElement('#opponent-info .turn-indicator')
const ai_thinking = getElement('#ai-thinking')
const game_actions = getElement('#game-actions')
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
const join_game_cancel_btn = getElement('#join-game-cancel-btn')
const random_opponent_btn = getElement('#random-opponent-btn')
const random_opponent_options = getElement('#random-opponent-options')
const random_opponent_alert = getElement('#random-opponent-alert')
const random_opponent_cancel_btn = getElement('#random-opponent-cancel-btn')
const resign_btn = getElement('#resign-btn')
const draw_btn = getElement('#draw-btn')
const ai_game_btn = getElement('#ai-game-btn')
const ai_game_options = getElement('#ai-game-options')
const exit_game_btn = getElement('#exit-game-btn')
const slide_from_left = document.querySelectorAll('.slide-left')
const slide_from_right = document.querySelectorAll('.slide-right')

const logged_out_elements = [quick_game_btn]
const logged_in_elements = [log_out_btn, new_game_btn, join_game_btn, random_opponent_btn, ai_game_btn]
const out_of_game_menu_elements = [log_out_btn, new_game_btn, join_game_btn, random_opponent_btn, ai_game_btn]
const in_game_menu_elements = [exit_game_btn]
const sidebar_toggle_elements = [quick_game_options, new_game_options, join_game_options, log_out_options, random_opponent_options, ai_game_options, quick_game_input_alert, join_game_input_alert]




//? SLIDE IN OF ELEMENTS FROM SIDES:

slide_from_left.forEach((element) => {element.classList.add('appear')})
slide_from_right.forEach((element) => {element.classList.add('appear')})




//? OPENING AND CLOSING OF VISUAL OPTION ELEMENTS (PURELY AESTHETIC):

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
            hideElements([elem])
        }
    }
}

function hideAllToggleElements(){
    hideElements(sidebar_toggle_elements)
}

function showSeekingOrWaitingOptionElements(){
    if (is_seeking_random_g){
        showElements([random_opponent_options])
    }
    if (is_waiting_join_g){
        showElements([join_game_options, join_game_input_alert])
    }
}

function toggleSidebarOptions(elem){
    const was_hidden = elem.classList.contains('hidden')
    toggleHideOrShow(elem)
    hideAllToggleElementsExceptEspecified(elem)
    showSeekingOrWaitingOptionElements()
    if (was_hidden && !elem.classList.contains('hidden')){
        scrollSidebarSectionIntoView(elem)
    }
}

function scrollSidebarSectionIntoView(options_elem){
    const aside_elem = options_elem.closest('aside')
    if (!aside_elem){
        return
    }

    const scroll_expanded_section = () => {
        const aside_can_scroll = aside_elem.scrollHeight > aside_elem.clientHeight + 1
        if (!aside_can_scroll){
            const section_btn = options_elem.previousElementSibling
            const top_target = section_btn || options_elem
            top_target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            const last_option = options_elem.lastElementChild
            if (last_option){
                last_option.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
            return
        }

        const aside_rect = aside_elem.getBoundingClientRect()
        const options_rect = options_elem.getBoundingClientRect()
        const section_btn = options_elem.previousElementSibling
        const top_rect = section_btn ? section_btn.getBoundingClientRect() : options_rect
        const overflow_bottom = options_rect.bottom - aside_rect.bottom
        const overflow_top = aside_rect.top - top_rect.top

        if (overflow_bottom > 0){
            aside_elem.scrollBy({ top: overflow_bottom + 12, behavior: 'smooth' })
        } else if (overflow_top > 0){
            aside_elem.scrollBy({ top: -(overflow_top + 12), behavior: 'smooth' })
        }
    }

    // Wait for the options height transition so the final bounds are used
    setTimeout(scroll_expanded_section, 220)
}

function updateLeftSidebarToLogIn(username){
    user_data_name.textContent = username
    toggleHideOrShow(quick_game_options)
    hideElements(logged_out_elements)
    showElements(logged_in_elements)
    hideElements(in_game_menu_elements)
}

function updateLeftSidebarToLogOut(){
    user_data_name.textContent = "\u00a0"
    toggleHideOrShow(log_out_options)
    hideElements(logged_in_elements)
    hideElements(in_game_menu_elements)
    showElements(logged_out_elements)
}

function updateSidebarForActiveGame(){
    hideElements(out_of_game_menu_elements)
    hideAllToggleElements()
    showElements(in_game_menu_elements)
}

function updateSidebarForNoActiveGame(){
    hideElements(in_game_menu_elements)
    showElements(out_of_game_menu_elements)
}

function updateDrawButtonVisibility(){
    const draw_container = draw_btn.closest('.btn-container') || draw_btn.parentElement
    if (is_ai_game_g){
        hideElements([draw_container])
    } else {
        showElements([draw_container])
    }
}

function showGameActions(){
    showElements([game_actions])
    updateDrawButtonVisibility()
}

function hideGameActions(){
    hideElements([game_actions])
}

quick_game_btn.addEventListener('click', () => {
    toggleSidebarOptions(quick_game_options)
})

log_out_btn.addEventListener('click', () => {
    toggleSidebarOptions(log_out_options)
})

new_game_btn.addEventListener('click', () => {
    toggleSidebarOptions(new_game_options)
})

join_game_btn.addEventListener('click', () => {
    toggleSidebarOptions(join_game_options)
})

ai_game_btn.addEventListener('click', () => {
    toggleSidebarOptions(ai_game_options)
})




//? FUNCTIONS FOR OPENING AND CLOSING FUNCTIONAL ELEMENTS:

// 'special_btns' may be 'join', 'cancel', 'cancel-search', 'cancel-join', 'promotion', 'resign', 'draw', 'share'
function openBoardAlertPopup(title, content, special_btns = null){
    board_alert_join_btn.classList.add('hidden')
    board_alert_ignore_btn.classList.add('hidden')
    board_alert_cancel_btn.classList.add('hidden')
    board_alert_cancel_search_btn.classList.add('hidden')
    board_alert_cancel_join_btn.classList.add('hidden')
    board_alert_promotion_btns.classList.add('hidden')
    board_alert_confirm_resign_btn.classList.add('hidden')
    board_alert_accept_draw_btn.classList.add('hidden')
    board_alert_deny_draw_btn.classList.add('hidden')
    board_alert_copy_link_btn.classList.add('hidden')
    board_alert_ok_btn.classList.add('hidden')
    board_alert_close_btn.classList.remove('hidden')

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
    } else if (special_btns === 'cancel-search'){
        board_alert_cancel_search_btn.classList.remove('hidden')
    } else if (special_btns === 'cancel-join'){
        board_alert_cancel_join_btn.classList.remove('hidden')
    } else if (special_btns === 'promotion'){
        board_alert_promotion_btns.classList.remove('hidden')
        board_alert_close_btn.classList.add('hidden')
    } else if (special_btns === 'resign'){
        board_alert_confirm_resign_btn.classList.remove('hidden')
    } else if (special_btns === 'draw'){
        board_alert_accept_draw_btn.classList.remove('hidden')
        board_alert_deny_draw_btn.classList.remove('hidden')
    } else if (special_btns === 'share'){
        board_alert_copy_link_btn.classList.remove('hidden')
        board_alert_ok_btn.classList.remove('hidden')
        board_alert_ok_btn.textContent = 'OK'
    } else {
        board_alert_ok_btn.classList.remove('hidden')
        board_alert_ok_btn.textContent = 'OK'
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
    board_alert_cancel_search_btn.classList.add('hidden')
    board_alert_cancel_join_btn.classList.add('hidden')
    board_alert_promotion_btns.classList.add('hidden')
    board_alert_confirm_resign_btn.classList.add('hidden')
    board_alert_accept_draw_btn.classList.add('hidden')
    board_alert_deny_draw_btn.classList.add('hidden')
    board_alert_copy_link_btn.classList.add('hidden')
    board_alert_ok_btn.classList.add('hidden')
    board_alert_ok_btn.textContent = 'OK'
    board_alert_close_btn.classList.remove('hidden')
    pending_share_url_g = null
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




//? INPUT VALIDATION FUNCTIONS:

function validateUsername(username){
    const str_username = String(username)
    return (str_username.match(/^[A-Za-z][A-Za-z0-9_]{5,17}$/)) ? true : false
}

function validateJoinCode(join_code){
    return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/i.test(String(join_code).trim())
}

function normalizeJoinTarget(join_target){
    return String(join_target).trim()
}




//? BOARD CREATION FUNCTIONS:

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




//? BOARD DELETION FUNCTIONS:

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

function clearMoveTableEmptyMessage(){
    const empty_message = move_table_content.querySelector('.move-table-empty')
    if (empty_message){
        empty_message.remove()
    }
}

function showMoveTableEmptyMessage(){
    clearMoveTableEmptyMessage()
    const empty_message = document.createElement('div')
    empty_message.classList.add('move-table-empty')
    empty_message.textContent = 'Moves will appear here once a game starts.'
    move_table_content.appendChild(empty_message)
}

// clear all game data on front end
function clearBoardVisualsKeepMoves(){
    deactivateBoard()
    deletePiecesFromBoard()
    deletePiecesFromCapturedPiecesContainers()
    board_element.style.backgroundImage = 'url(../images/checkered-board.svg)'
    opponent_name.textContent = ""
    hideElements([opponent_info])
    hideGameActions()
    setAiThinkingVisible(false)
    current_turn_g = 'white'
    hideElements([player_turn_indicator, opponent_turn_indicator])
}

function clearGameData(){
    clearBoardVisualsKeepMoves()
    deleteLastMovesFromTable()
    showMoveTableEmptyMessage()
}




//? PLAYER CREATION AND DELETION, AND GAME CREATION AND JOINING:

function updateInputWithClearButtonState(input_element, action_btn){
    const has_value = (input_element.value.trim().length > 0)
    action_btn.disabled = !has_value
    input_element.closest('.input-with-clear')?.classList.toggle('has-value', has_value)
}

function updateQuickGameInputButtonState(){
    updateInputWithClearButtonState(quick_game_input, quick_game_input_btn)
}

function updateJoinInputButtonState(){
    updateInputWithClearButtonState(join_game_input, join_game_input_btn)
}

function clearTextInput(input_element){
    input_element.value = ''
    input_element.dispatchEvent(new Event('input', { bubbles: true }))
    input_element.focus()
}

function bindInputClearButtons(){
    document.querySelectorAll('.input-clear-btn').forEach((clear_btn) => {
        clear_btn.addEventListener('click', () => {
            const input_element = getElement(`#${clear_btn.dataset.clearInput}`)
            if (input_element){
                clearTextInput(input_element)
            }
        })
    })
}

function applyPendingJoinTargetFromUrl(){
    if (!pending_join_target_g){
        return
    }
    join_game_input.value = pending_join_target_g
    showElements([join_game_options])
    hideAllToggleElementsExceptEspecified(join_game_options)
    updateJoinInputButtonState()
}

function clearPendingJoinTargetFromUrl(){
    if (!pending_join_target_g){
        return
    }
    pending_join_target_g = null
    const clean_url = `${window.location.origin}${window.location.pathname}`
    window.history.replaceState({}, '', clean_url)
}

function clearRandomSearchState(){
    is_seeking_random_g = false
    closeRandomOpponentAlert()
    hideElements([random_opponent_cancel_btn])
}

function clearJoinWaitState(){
    is_waiting_join_g = false
    closeJoinGameAlert()
    hideElements([join_game_cancel_btn])
}

function cancelRandomSearch(){
    socket.emit('cancelRandomSearch')
    clearRandomSearchState()
}

function cancelJoinRequest(){
    socket.emit('cancelJoinRequest')
    clearJoinWaitState()
}

function openCancelPendingRequestPopup(){
    if (is_seeking_random_g){
        const title = "Cancel search?"
        const text = "This will stop looking for a random opponent."
        openBoardAlertPopup(title, text, 'cancel-search')
        return true
    }
    if (is_waiting_join_g){
        const title = "Cancel join request?"
        const text = "This will withdraw your request to join the game."
        openBoardAlertPopup(title, text, 'cancel-join')
        return true
    }
    return false
}

function startRandomSearch(){
    is_seeking_random_g = true
    openRandomOpponentAlert("Looking for an opponent…")
    showElements([random_opponent_cancel_btn])
    hideAllToggleElementsExceptEspecified(random_opponent_options)
    socket.emit('randomGame', generateRandomColor())
}

function startJoinWait(opponents_username){
    is_waiting_join_g = true
    openJoinGameAlert("Waiting for player to respond...")
    showElements([join_game_cancel_btn])
    hideAllToggleElementsExceptEspecified(join_game_options)
    socket.emit('joinGame', opponents_username)
}

quick_game_input.addEventListener('input', updateQuickGameInputButtonState)
join_game_input.addEventListener('input', updateJoinInputButtonState)
bindInputClearButtons()
updateQuickGameInputButtonState()
updateJoinInputButtonState()

quick_game_input_btn.addEventListener('click', () => {
    const proposed_username = quick_game_input.value

    if (validateUsername(proposed_username)){
        closeQuickGameAlert()
        socket.emit('createPlayer', proposed_username)
    } else {
        openQuickGameAlert("Please choose a username (only letters, numbers and underscores) between 6 and 18 characters long, or click on random")
    }
})

quick_game_random_btn.addEventListener('click', () => {
    socket.emit('createPlayer', 'random')
})

socket.on('logInSuccessful', (username) => { // temporarily on playerCreated
    updateLeftSidebarToLogIn(username)
    player_name.textContent = username
    showElements([player_info])
    applyPendingJoinTargetFromUrl()

    const title = `Welcome, ${username}`
    const text = "Create a new game, join a friend with their username or join code, find a random opponent, or play the computer."
    openBoardAlertPopup(title, text)
})

socket.on('playerCreationError', (error) => {
    openQuickGameAlert(error)
})

log_out_confirm_btn.addEventListener('click', () => {
    if (openCancelPendingRequestPopup()){
        return
    }
    socket.emit('deletePlayer') // temporary, should be logPlayerOut
})

socket.on('logOutSuccessful', () => { // temporarily on playerDeleted
    clearRandomSearchState()
    clearJoinWaitState()
    updateLeftSidebarToLogOut()
    clearGameData()
    player_name.textContent = ""
    hideElements([player_info])

    const title = "Username cleared"
    const text = "Press Start playing in the menu to choose a username again."
    openBoardAlertPopup(title, text)
})

new_game_options.addEventListener('click', (event) => {
    const elem_id = event.target.id
    const possible_colors = {'new-game-color-white': 'white', 'new-game-color-random': generateRandomColor(), 'new-game-color-black': 'black'}
    
    const color = possible_colors[elem_id]
    if (color){
        if (openCancelPendingRequestPopup()){
            return
        }
        socket.emit('createGame', color)
    }
})

socket.on('newGameCreated', (payload) => {
    const board = Array.isArray(payload) ? payload[0] : payload.board
    const player_color = Array.isArray(payload) ? payload[1] : payload.player_color
    const join_code = Array.isArray(payload) ? payload[2] : payload.join_code

    clearGameData()
    clearRandomSearchState()
    clearJoinWaitState()
    createBoard(board, player_color)
    player_color_g = player_color
    is_ai_game_g = false
    current_turn_g = 'white'
    hideElements([player_turn_indicator, opponent_turn_indicator])
    updateSidebarForActiveGame()

    const share_url = join_code
        ? `${window.location.origin}${window.location.pathname}?join=${join_code}`
        : null
    pending_share_url_g = share_url
    const title = "Game ready"
    const text = join_code
        ? `Share join code ${join_code} with a friend, or copy the invite link below. They can also join with your username.`
        : "Ask a friend to join with your username, or share a join code once available."
    openBoardAlertPopup(title, text, join_code ? 'share' : null)
    hideAllToggleElements()
})

join_game_input_btn.addEventListener('click', () => {
    const join_target = normalizeJoinTarget(join_game_input.value)

    if (!validateUsername(join_target) && !validateJoinCode(join_target)){
        openJoinGameAlert("Enter a username (6–18 characters) or a 4-character join code")
        return
    }

    if (is_waiting_join_g){
        return
    }

    if (openCancelPendingRequestPopup()){
        return
    }

    const normalized_target = validateJoinCode(join_target) ? join_target.toUpperCase() : join_target
    startJoinWait(normalized_target)
})

socket.on('joinGameRequest', (opponent_username) => {
    requesting_opponent_g = opponent_username
    
    const title = "Join Request"
    const text = `Player ${opponent_username} would like to join your game; would you like to accept?`
    openBoardAlertPopup(title, text, 'join')
})

socket.on('joinRequestCancelled', (opponent_username) => {
    if (requesting_opponent_g === opponent_username){
        requesting_opponent_g = null
        closeBoardAlertPopup()
    }
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
    clearJoinWaitState()
    clearRandomSearchState()
    player_color_g = player_color
    current_turn_g = 'white'
    updateTurnIndicators()

    const title = "Joined game"
    const text = "Close this window to begin playing."
    openBoardAlertPopup(title, text)
})

// gets sent to both players
socket.on('joinGameSuccessful', (opponent_username, is_ai_game = false) => {
    opponent_name.textContent = opponent_username
    showElements([opponent_info])
    is_ai_game_g = is_ai_game
    updateSidebarForActiveGame()
    showGameActions()
    clearRandomSearchState()
    clearJoinWaitState()
    current_turn_g = current_turn_g || 'white'
    updateTurnIndicators()
    socket.emit('cacheOpponentAndGame')
    hideAllToggleElements()
    clearPendingJoinTargetFromUrl()
})

socket.on('joinGameError', (error) => {
    clearJoinWaitState()
    openJoinGameAlert(error)
})

random_opponent_btn.addEventListener('click', () => {
    if (is_seeking_random_g){
        cancelRandomSearch()
        return
    }
    if (openCancelPendingRequestPopup()){
        return
    }
    startRandomSearch()
})

random_opponent_cancel_btn.addEventListener('click', () => {
    cancelRandomSearch()
})

join_game_cancel_btn.addEventListener('click', () => {
    cancelJoinRequest()
    hideElements([join_game_options])
})

ai_game_options.addEventListener('click', (event) => {
    const elem_id = event.target.id
    const possible_difficulties = {
        'ai-game-easy-btn': 'easy',
        'ai-game-medium-btn': 'medium',
        'ai-game-hard-btn': 'hard'
    }
    const difficulty = possible_difficulties[elem_id]
    if (difficulty){
        if (openCancelPendingRequestPopup()){
            return
        }
        const color = generateRandomColor()
        socket.emit('createAiGame', [color, difficulty])
        hideAllToggleElements()
    }
})




//? GAME INTERACTION MESSAGES:

function cancelCurrentGame(){
    socket.emit('confirmCancel')
    clearGameData()
}

function openCancelCurrentGamePopup(){
    const title = "Cancel current game?"
    const text = "This action will cancel the current game."
    openBoardAlertPopup(title, text, 'cancel')
}

socket.on('clearCache', () => {
    player_color_g = null
    requesting_opponent_g = null
    move_counter_g = 1
    is_ai_game_g = false
    is_ai_thinking_g = false
    current_turn_g = 'white'
    resetStockfishEngine()
    setAiThinkingVisible(false)
    hideGameActions()
    updateTurnIndicators()
    updateSidebarForNoActiveGame()
    socket.emit('clearCacheOfOpponentAndGame')
})

exit_game_btn.addEventListener('click', () => {
    openCancelCurrentGamePopup()
})

board_alert_close_btn.addEventListener('click', () => {
    if (board_alert_title.textContent === "Join Request"){
        ignoreJoinRequest()
    } else {
        closeBoardAlertPopup()
    }
})

function copyShareUrlToClipboard(){
    if (!pending_share_url_g){
        return
    }
    navigator.clipboard.writeText(pending_share_url_g).then(() => {
        board_alert_copy_link_btn.textContent = 'Copied!'
        setTimeout(() => {
            board_alert_copy_link_btn.textContent = 'Copy link'
        }, 1600)
    }).catch(() => {
        board_alert_content.textContent = `Copy this link: ${pending_share_url_g}`
    })
}

board_alert_ok_btn.addEventListener('click', () => {
    closeBoardAlertPopup()
})

board_alert_copy_link_btn.addEventListener('click', () => {
    copyShareUrlToClipboard()
})

socket.on('askIfCancelCurrentGame', () => {
    openCancelCurrentGamePopup()
})

board_alert_cancel_btn.addEventListener('click', () => {
    cancelCurrentGame()
    closeBoardAlertPopup()
})

board_alert_cancel_search_btn.addEventListener('click', () => {
    cancelRandomSearch()
    closeBoardAlertPopup()
})

board_alert_cancel_join_btn.addEventListener('click', () => {
    cancelJoinRequest()
    hideElements([join_game_options])
    closeBoardAlertPopup()
})

resign_btn.addEventListener('click', () => {
    const title = "Resign"
    const text = "Are you sure you would like to resign?"
    openBoardAlertPopup(title, text, 'resign')
})

board_alert_confirm_resign_btn.addEventListener('click', () => {
    socket.emit('resign')
    const score = (player_color_g === 'white') ? '0-1' : '1-0'
    createNewMoveTableItem(score)
    socket.emit('confirmCancel')
    closeBoardAlertPopup()
    presentFinishedGame("You resigned")
})

socket.on('opponentResigned', () => {
    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
    presentFinishedGame("Game won — opponent resigned!")
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
    createNewMoveTableItem('½–½')
    presentFinishedGame("Draw by mutual agreement")
})

socket.on('informDeniedDrawRequest', () => {
    const title = "Draw request was denied by opponent"
    const text = "Close this window to continue playing"
    openBoardAlertPopup(title, text)
})




//? FINISHED GAME MESSAGES:

function presentFinishedGame(title){
    clearBoardVisualsKeepMoves()
    updateSidebarForNoActiveGame()
    openBoardAlertPopupForFinishedGame(title)
}

function openBoardAlertPopupForFinishedGame(title){
    const text = "Create a new game, join a friend, find a random opponent, or play the computer whenever you're ready."
    openBoardAlertPopup(title, text)
}

socket.on('gameCancelledByOpponent', () => {
    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
    presentFinishedGame("Game cancelled by opponent")
})

socket.on('opponentLoggedOut', () => {
    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
    presentFinishedGame("Opponent logged out")
})

socket.on('gameOverByCheckmateWon', () => {
    createNewMoveTableItem('#')
    const score = (player_color_g === 'white') ? '1-0' : '0-1'
    createNewMoveTableItem(score)
    presentFinishedGame("Checkmate — you win!")
})

socket.on('gameOverByCheckmateLost', () => {
    createNewMoveTableItem('#')
    const score = (player_color_g === 'white') ? '0-1' : '1-0'
    createNewMoveTableItem(score)
    presentFinishedGame("Checkmate — you lose")
})

socket.on('gameOverByStalemate', () => {
    createNewMoveTableItem('½–½')
    presentFinishedGame("Draw by stalemate")
})

socket.on('gameOverByDeadPosition', () => {
    createNewMoveTableItem('½–½')
    presentFinishedGame("Draw by dead position")
})




//? GAME:

function updateTurnIndicators(){
    if (!player_color_g){
        hideElements([player_turn_indicator, opponent_turn_indicator])
        return
    }
    const is_player_turn = (current_turn_g === player_color_g)
    if (is_player_turn){
        showElements([player_turn_indicator])
        hideElements([opponent_turn_indicator])
        player_turn_indicator.classList.add('active')
        opponent_turn_indicator.classList.remove('active')
    } else {
        showElements([opponent_turn_indicator])
        hideElements([player_turn_indicator])
        opponent_turn_indicator.classList.add('active')
        player_turn_indicator.classList.remove('active')
    }
}

function setCurrentTurnToOppositeColor(piece_color){
    current_turn_g = (piece_color === 'white') ? 'black' : 'white'
    updateTurnIndicators()
}

function setAiThinkingVisible(is_visible){
    if (is_visible){
        showElements([ai_thinking])
    } else {
        hideElements([ai_thinking])
    }
}

function scrollMoveTableToBottom(){
    move_table_content.scrollTop = move_table_content.scrollHeight
}

function playAiMoveFromStockfish(ai_turn_payload){
    if (is_ai_thinking_g){
        return
    }

    is_ai_thinking_g = true
    setAiThinkingVisible(true)

    try {
        const fen = boardToFen(ai_turn_payload.board, ai_turn_payload.current_turn)
        const skill_level = getSkillLevelFromDifficulty(ai_turn_payload.difficulty)
        const move_time_ms = getMoveTimeFromDifficulty(ai_turn_payload.difficulty)

        getBestMoveFromStockfish(fen, skill_level, move_time_ms).then((uci_move) => {
            if (!uci_move || (uci_move === '(none)')){
                socket.emit('aiMoveFailed')
                is_ai_thinking_g = false
                setAiThinkingVisible(false)
                return
            }

            const { from_cell, to_cell, promotion_type } = uciMoveToCellsAndPromotion(uci_move)
            socket.emit('aiMoveMade', [from_cell, to_cell, promotion_type])
            is_ai_thinking_g = false
            setAiThinkingVisible(false)
        }).catch((error) => {
            console.log('Stockfish AI error:', error)
            socket.emit('aiMoveFailed')
            is_ai_thinking_g = false
            setAiThinkingVisible(false)
        })
    } catch (error) {
        console.log('Stockfish AI setup error:', error)
        is_ai_thinking_g = false
        setAiThinkingVisible(false)
    }
}

socket.on('aiTurnToMove', (ai_turn_payload) => {
    playAiMoveFromStockfish(ai_turn_payload)
})

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

    const title = "Promote pawn"
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

function getCapturedPiecesContainer(captured_piece, player_color){
    if (captured_piece.color === player_color){
        return opponent_captured_pieces
    }
    return player_captured_pieces
}

function getCapturedPieceLandingRect(destination_container, captured_piece_elem){
    const probe = captured_piece_elem.cloneNode(false)
    probe.className = 'captured-piece'
    probe.style.visibility = 'hidden'
    probe.removeAttribute('id')
    destination_container.appendChild(probe)
    const landing_rect = probe.getBoundingClientRect()
    probe.remove()
    return landing_rect
}

function animatePieceTowardCaptureTray(captured_piece_elem, landing_rect){
    const board_rect = board_element.getBoundingClientRect()
    if (!(board_rect.width > 0 && board_rect.height > 0 && landing_rect.width > 0)){
        return
    }
    const left_pct = ((landing_rect.left - board_rect.left) / board_rect.width) * 100
    const top_pct = ((landing_rect.top - board_rect.top) / board_rect.height) * 100
    captured_piece_elem.style.left = `${left_pct}%`
    captured_piece_elem.style.top = `${top_pct}%`
    captured_piece_elem.style.height = `${landing_rect.height}px`
    captured_piece_elem.style.zIndex = '5'
}

function settleCapturedPieceInTray(captured_piece_elem, destination_container){
    captured_piece_elem.classList.add('captured-piece')
    captured_piece_elem.classList.remove('piece')
    captured_piece_elem.style.left = ''
    captured_piece_elem.style.top = ''
    captured_piece_elem.style.height = ''
    captured_piece_elem.style.zIndex = ''
    destination_container.appendChild(captured_piece_elem)
}

function removeCapturedPieceFromBoard(captured_piece, player_color){
    const captured_piece_elem = getPieceElement(captured_piece)
    if (!captured_piece_elem){
        return
    }

    const destination_container = getCapturedPiecesContainer(captured_piece, player_color)
    const landing_rect = getCapturedPieceLandingRect(destination_container, captured_piece_elem)
    animatePieceTowardCaptureTray(captured_piece_elem, landing_rect)

    let settled = false
    const finishCaptureAnimation = () => {
        if (settled){
            return
        }
        settled = true
        settleCapturedPieceInTray(captured_piece_elem, destination_container)
    }

    captured_piece_elem.addEventListener('transitionend', finishCaptureAnimation, { once: true })
    setTimeout(finishCaptureAnimation, 280)
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
    clearMoveTableEmptyMessage()

    let new_move_table_item_text = ''
    new_move_table_item_text += String(move_counter_g)
    new_move_table_item_text += '.  '
    new_move_table_item_text += move_table_item_text
    move_counter_g += 1

    const new_move_table_item = document.createElement('div')
    new_move_table_item.classList.add('move-table-item')
    new_move_table_item.textContent = new_move_table_item_text
    move_table_content.appendChild(new_move_table_item)
    scrollMoveTableToBottom()
}

function appendTextToLastNewMoveTableItem(move_table_item_text){
    const all_items = document.querySelectorAll('.move-table-item')
    const last_move_table_item = all_items[all_items.length-1]

    let last_move_table_item_text = last_move_table_item.textContent
    last_move_table_item_text += move_table_item_text
    last_move_table_item.textContent = last_move_table_item_text
    scrollMoveTableToBottom()
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
    } else {
        setCurrentTurnToOppositeColor(moved_piece.color)
    }
})

board_alert_promotion_btns.addEventListener('click', (event) => {
    const elem_id = event.target.id
    const possible_types = {'promotion-type-knight-btn': 'knight', 'promotion-type-bishop-btn': 'bishop', 'promotion-type-rook-btn': 'rook', 'promotion-type-queen-btn': 'queen'}
    
    const type = possible_types[elem_id]
    if (type){
        socket.emit('pawnPromotionTypeChosen', type)
        closeBoardAlertPopup()
    }
})

socket.on('promotePawn', ([unpromoted_pawn, promoted_pawn]) => {
    const pawn_element = getPieceElement(unpromoted_pawn)
    pawn_element.id = promoted_pawn.id
    addImageSourceToPieceElement(pawn_element, promoted_pawn.color, promoted_pawn.type)

    const pawnPromotionTypeNotation = piece_names[promoted_pawn.type]
    appendTextToLastNewMoveTableItem(pawnPromotionTypeNotation)

    setCurrentTurnToOppositeColor(promoted_pawn.color)
})
