
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const players_db = require('./utils/players')
const games_db = require('./utils/games');
const game_engine = require('./game-server/game-engine')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname,'/view')));

app.get('/',(req,res)=>{
    return res.sendFile(path.join(__dirname,'/view/index.html'))
});

io.on('connection', socket => {

    let player_g = null
    let opponent_g = null
    let game_g = null

    function validatedStringData(data, regex){
        const string = String(data)
        if (string && string.match(regex)){
            return string
        } else {
            return false
        }
    }

    function validatedUsername(username){
        const regex = /^[A-Za-z][A-Za-z0-9_]{5,17}$/
        return validatedStringData(username, regex)
    }

    function validatedJoinCode(join_code){
        const regex = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/
        return validatedStringData(String(join_code).toUpperCase(), regex)
    }

    function validatedColor(color){
        const regex = /^(white|black|random)$/
        return validatedStringData(color, regex)
    }

    function validatedPromotionType(type){
        const regex = /^(queen|rook|bishop|knight)$/
        return validatedStringData(type, regex)
    }

    function validatedCell(cell){
        if (cell === null){
            return null
        } else if (Array.isArray(cell) && (cell.length === 2)){
            const y = parseInt(cell[0])
            const x = parseInt(cell[1])
            const regex = /^[0-7]$/
            if (String(y).match(regex) && String(x).match(regex)){
                return [y, x]
            } else {
                return false
            }
        } else {
            return false
        }
    }

    function stopGame(message_event){
        if (game_g){
            games_db.deleteGame(game_g.id)
        }
        game_g = null
        if (opponent_g){
            players_db.unlinkPlayerToGame(opponent_g.id)
            if (message_event){
                io.to(opponent_g.current_socket_id).emit(message_event)
                io.to(opponent_g.current_socket_id).emit('clearCache')
            }
        }
        opponent_g = null
        if (player_g){
            players_db.unlinkPlayerToGame(player_g.id)
        }
        socket.emit('clearCache')
    }

    function removePlayer(){
        stopGame('opponentLoggedOut')
        if (player_g){
            players_db.removeAwaitingPlayerIfIsCurrentPlayer(player_g.id)
            if (player_g.pending_join_id){
                const host = players_db.getPlayer(player_g.pending_join_id)
                if (host?.current_socket_id){
                    io.to(host.current_socket_id).emit('joinRequestCancelled', player_g.username)
                }
                player_g.pending_join_id = null
            }
            players_db.deletePlayer(player_g.id) // temporary, should be log out
        }
        player_g = null
    }

    function validatedDifficulty(difficulty){
        const regex = /^(easy|medium|hard)$/
        return validatedStringData(difficulty, regex)
    }

    function getAiTurnPayload(game){
        return {
            board: game.board,
            current_turn: game.current_turn,
            difficulty: game.ai_difficulty
        }
    }

    function requestAiMoveIfNeeded(){
        if (game_g && game_g.is_ai_game && (game_g.current_turn === game_g.ai_color)){
            socket.emit('aiTurnToMove', getAiTurnPayload(game_g))
        }
    }

    function applyAiMove(from_cell, to_cell, promotion_type){
        const ai_color = game_g.ai_color
        const select_instructions = game_engine.getInstructionsForSelection(from_cell, game_g, ai_color)
        for (let instruction of select_instructions){
            if (instruction.action === 'updateSelection'){
                const { new_active_moves, new_last_selected_cell } = instruction.params
                games_db.updateGameSelection(game_g.id, ai_color, new_active_moves, new_last_selected_cell)
            }
        }

        if (!game_g[ai_color].last_selected_cell){
            games_db.updateGameSelection(game_g.id, ai_color, [], null)
            return false
        }

        const move_instructions = game_engine.getInstructionsForSelection(to_cell, game_g, ai_color)
        let move_was_made = false
        for (let instruction of move_instructions){
            const action = instruction.action

            if (action === 'updateSelection'){
                const { new_active_moves, new_last_selected_cell } = instruction.params
                games_db.updateGameSelection(game_g.id, ai_color, new_active_moves, new_last_selected_cell)

            } else if (action === 'updateMove'){
                const { new_play, new_board } = instruction.params
                games_db.updateGameMove(game_g.id, ai_color, new_play, new_board)

            } else if (action === 'deactivateBoard'){
                socket.emit('deactivateBoard')

            } else if (action === 'movePiece'){
                const new_play = instruction.params
                socket.emit('movePiece', [new_play, player_g.active_color])
                move_was_made = true
            }
        }

        if (!move_was_made){
            games_db.updateGameSelection(game_g.id, ai_color, [], null)
            return false
        }

        if (game_g[ai_color].promotion_cell){
            let validated_promotion_type = promotion_type
            if (!validated_promotion_type){
                validated_promotion_type = 'queen'
            }
            const unpromoted_pawn = games_db.getPawnEligibleForPromotion(game_g.id, ai_color)
            const promoted_pawn = games_db.promotePawnAndReturnIt(game_g.id, ai_color, validated_promotion_type)
            socket.emit('promotePawn', [unpromoted_pawn, promoted_pawn])
        }

        checkAndEmitGameOver(ai_color)
        return true
    }

    function applyAiMoveOrFallback(from_cell, to_cell, promotion_type){
        if (from_cell && to_cell && applyAiMove(from_cell, to_cell, promotion_type)){
            return
        }

        const legal_move = game_engine.getAnyLegalMove(game_g, game_g.ai_color)
        if (!legal_move){
            games_db.updateGameSelection(game_g.id, game_g.ai_color, [], null)
            checkAndEmitGameOver(player_g.active_color)
            return
        }

        socket.emit('consoleLogError', 'AI move was illegal; applying a legal fallback move')
        applyAiMove(legal_move.from_cell, legal_move.to_cell, 'queen')
    }

    function checkAndEmitGameOver(moved_color){
        if (!player_g || !game_g){
            return
        }

        if (!moved_color){
            moved_color = player_g.active_color
        }

        const game_over_state = game_engine.getGameOverState(game_g, moved_color)

        if (game_over_state === 'checkmate'){
            if (moved_color === player_g.active_color){
                socket.emit('gameOverByCheckmateWon')
                stopGame('gameOverByCheckmateLost')
            } else {
                socket.emit('gameOverByCheckmateLost')
                stopGame(null)
            }

        } else if (game_over_state === 'stalemate'){
            socket.emit('gameOverByStalemate')
            stopGame('gameOverByStalemate')

        } else if (game_over_state === 'deadPosition'){
            socket.emit('gameOverByDeadPosition')
            stopGame('gameOverByDeadPosition')

        }
    }

    socket.on('createPlayer', (username) => {
        const validated_username = validatedUsername(username)
        if (validated_username === false){
            const error = "Error creating player: username may only contain letters, numbers and underscores, start with a letter, and be 6 to 18 characters long"
            socket.emit('consoleLogError', error)
            return
        }

        const is_username_available = players_db.isUsernameAvailable(validated_username)
        if (is_username_available){
            players_db.createPlayer(validated_username, "", socket.id)
            const player_id = players_db.getPlayerIdFromSocketId(socket.id)
            player_g = players_db.getPlayer(player_id)
            socket.emit('logInSuccessful', player_g.username) // temporary, should be playerCreationSuccessful
        } else {
            const error = "Username is not available, please provide a different one"
            socket.emit('playerCreationError', error)
        }
    })

    socket.on('deletePlayer', () => {
        if (!player_g){
            return
        }

        if (player_g.active_game_id){
            socket.emit('askIfCancelCurrentGame')
        } else {
            removePlayer()
            socket.emit('logOutSuccessful') // temporary, should be playerDeletionSuccessful
        }
    })

    socket.on('createGame', (color) => {
        const validated_color = validatedColor(color)
        if (validated_color === false){
            const error = "Error creating game: color may only be white, black or random"
            socket.emit('consoleLogError', error)
            return
        }
        
        if (!player_g){
            return
        }

        if (player_g.active_game_id){
            socket.emit('askIfCancelCurrentGame')
        } else {
            if (player_g.pending_join_id){
                const host = players_db.getPlayer(player_g.pending_join_id)
                if (host?.current_socket_id){
                    io.to(host.current_socket_id).emit('joinRequestCancelled', player_g.username)
                }
                player_g.pending_join_id = null
            }
            games_db.createGame(player_g.id)
            game_g = games_db.getGame(player_g.id)
            players_db.linkPlayerToGame(player_g.id, game_g.id, validated_color)
            players_db.removeAwaitingPlayerIfIsCurrentPlayer(player_g.id)

            socket.emit('newGameCreated', {
                board: game_g.board,
                player_color: validated_color,
                join_code: game_g.join_code
            })
        }
    })

    socket.on('createAiGame', ([color, difficulty]) => {
        const validated_color = validatedColor(color)
        if (validated_color === false){
            const error = "Error creating AI game: color may only be white, black or random"
            socket.emit('consoleLogError', error)
            return
        }

        const validated_difficulty = validatedDifficulty(difficulty)
        if (validated_difficulty === false){
            const error = "Error creating AI game: difficulty may only be easy, medium or hard"
            socket.emit('consoleLogError', error)
            return
        }
        
        if (!player_g){
            return
        }

        if (player_g.active_game_id){
            socket.emit('askIfCancelCurrentGame')
        } else {
            if (player_g.pending_join_id){
                const host = players_db.getPlayer(player_g.pending_join_id)
                if (host?.current_socket_id){
                    io.to(host.current_socket_id).emit('joinRequestCancelled', player_g.username)
                }
                player_g.pending_join_id = null
            }
            let player_color = validated_color
            if (player_color === 'random'){
                player_color = (Math.random() < 0.5) ? 'white' : 'black'
            }

            games_db.createGame(player_g.id)
            game_g = games_db.getGame(player_g.id)
            game_g.is_ai_game = true
            game_g.ai_difficulty = validated_difficulty
            game_g.ai_color = (player_color === 'white') ? 'black' : 'white'

            players_db.linkPlayerToGame(player_g.id, game_g.id, player_color)
            players_db.removeAwaitingPlayerIfIsCurrentPlayer(player_g.id)

            socket.emit('newGameJoined', [game_g.board, player_color])
            socket.emit('joinGameSuccessful', 'Computer', true)
            requestAiMoveIfNeeded()
        }
    })

    socket.on('joinGame', (join_target) => {
        if (!player_g){
            return
        }

        const validated_join_code = validatedJoinCode(join_target)
        let possible_opponent_id = null
        let join_label = null

        if (validated_join_code){
            const host_game_id = games_db.getGameIdFromJoinCode(validated_join_code)
            if (host_game_id === null){
                socket.emit('joinGameError', `Join code '${validated_join_code}' was not found`)
                return
            }
            possible_opponent_id = host_game_id
            join_label = validated_join_code
        } else {
            const validated_opponent_username = validatedUsername(join_target)
            if (validated_opponent_username === false){
                socket.emit('joinGameError', 'Enter a valid username (6–18 characters) or a 4-character join code')
                return
            }
            possible_opponent_id = players_db.getPlayerIdFromUsername(validated_opponent_username)
            join_label = validated_opponent_username
            if (possible_opponent_id === null){
                socket.emit('joinGameError', `Username '${validated_opponent_username}' does not exist, please provide a different one`)
                return
            }
        }

        const possible_opponent = players_db.getPlayer(possible_opponent_id)
        if (!possible_opponent){
            socket.emit('joinGameError', 'That game host was not found')
            return
        }

        if (possible_opponent.current_socket_id === null){
            socket.emit('joinGameError', `${join_label} is currently not logged in`)
            return
        }

        if (possible_opponent.active_game_id === null){
            socket.emit('joinGameError', `${join_label} hasn't started a game yet — ask them to create a new game`)
            return
        }

        if (possible_opponent.active_opponent !== null){
            socket.emit('joinGameError', `${join_label} is already in an active game`)
            return
        }

        const possible_opponent_game = games_db.getGame(possible_opponent.active_game_id)
        if (possible_opponent_game?.is_ai_game){
            socket.emit('joinGameError', `${join_label} is already in an active game`)
            return
        }

        if (player_g.active_game_id){
            socket.emit('askIfCancelCurrentGame')
            return
        }

        if (player_g.pending_join_id && (player_g.pending_join_id !== possible_opponent.id)){
            const previous_host = players_db.getPlayer(player_g.pending_join_id)
            if (previous_host?.current_socket_id){
                io.to(previous_host.current_socket_id).emit('joinRequestCancelled', player_g.username)
            }
        }
        player_g.pending_join_id = possible_opponent.id
        io.to(possible_opponent.current_socket_id).emit('joinGameRequest', player_g.username)
    })

    socket.on('confirmJoin', (opponent_username) => {
        const validated_opponent_username = validatedUsername(opponent_username)
        if (validated_opponent_username === false){
            const error = "Error joining game: username may only contain letters, numbers and underscores, start with a letter, and be 6 to 18 characters long"
            socket.emit('consoleLogError', error)
            return
        }
        
        if (!player_g || !game_g){
            return
        }

        const possible_opponent_id = players_db.getPlayerIdFromUsername(validated_opponent_username)
        const possible_opponent = players_db.getPlayer(possible_opponent_id)
        if (!possible_opponent || (possible_opponent.pending_join_id !== player_g.id)){
            return
        }

        if (player_g.active_game_id && !player_g.active_opponent && !possible_opponent.active_game_id && !game_g.is_ai_game){
            possible_opponent.pending_join_id = null
            const opponent_color = (player_g.active_color === 'white') ? 'black' : 'white'
            players_db.linkPlayerToGame(possible_opponent.id, game_g.id, opponent_color)
            players_db.linkPlayersTogether(player_g.id, possible_opponent.id)
            
            socket.emit('joinGameSuccessful', possible_opponent.username)
            io.to(possible_opponent.current_socket_id).emit('newGameJoined', [game_g.board, possible_opponent.active_color])
            io.to(possible_opponent.current_socket_id).emit('joinGameSuccessful', player_g.username)
        }
    })

    socket.on('ignoreJoin', (opponent_username) => {
        const validated_opponent_username = validatedUsername(opponent_username)
        if (validated_opponent_username === false){
            const error = "Error joining game: username may only contain letters, numbers and underscores, start with a letter, and be 6 to 18 characters long"
            socket.emit('consoleLogError', error)
            return
        }

        const possible_opponent_id = players_db.getPlayerIdFromUsername(validated_opponent_username)
        if (possible_opponent_id){
            const possible_opponent = players_db.getPlayer(possible_opponent_id)
            possible_opponent.pending_join_id = null

            const error = "Join request was denied by player"
            io.to(possible_opponent.current_socket_id).emit('joinGameError', error)
        }
    })

    socket.on('cancelJoinRequest', () => {
        if (!player_g || !player_g.pending_join_id){
            return
        }

        const host = players_db.getPlayer(player_g.pending_join_id)
        player_g.pending_join_id = null
        if (host?.current_socket_id){
            io.to(host.current_socket_id).emit('joinRequestCancelled', player_g.username)
        }
    })

    socket.on('randomGame', (color) => {
        const validated_color = validatedColor(color)
        if (validated_color === false){
            const error = "Error creating game: color may only be white, black or random"
            socket.emit('consoleLogError', error)
            return
        }
        
        if (!player_g){
            return
        }

        if (player_g.active_game_id){
            socket.emit('askIfCancelCurrentGame')
        } else {
            const possible_opponent_id = players_db.getAwaitingPlayerIdOrQueueCurrentPlayer(player_g.id)
            if (possible_opponent_id){
                const possible_opponent = players_db.getPlayer(possible_opponent_id)

                games_db.createGame(player_g.id)
                game_g = games_db.getGame(player_g.id)
                players_db.linkPlayerToGame(player_g.id, player_g.id, validated_color)

                const opponent_color = (player_g.active_color === 'white') ? 'black' : 'white'
                players_db.linkPlayerToGame(possible_opponent.id, player_g.id, opponent_color)
                players_db.linkPlayersTogether(player_g.id, possible_opponent.id)
                
                socket.emit('newGameJoined', [game_g.board, player_g.active_color])
                socket.emit('joinGameSuccessful', possible_opponent.username)
                io.to(possible_opponent.current_socket_id).emit('newGameJoined', [game_g.board, possible_opponent.active_color])
                io.to(possible_opponent.current_socket_id).emit('joinGameSuccessful', player_g.username)
            }
        }
    })

    socket.on('cancelRandomSearch', () => {
        if (!player_g){
            return
        }
        players_db.removeAwaitingPlayerIfIsCurrentPlayer(player_g.id)
    })

    socket.on('cacheOpponentAndGame', () => {
        if (!player_g){
            return
        }
        opponent_g = players_db.getPlayer(player_g.active_opponent)
        game_g = games_db.getGame(player_g.active_game_id)
    })

    socket.on('clearCacheOfOpponentAndGame', () => {
        opponent_g = null
        game_g = null
    })

    socket.on('confirmCancel', () => {
        stopGame('gameCancelledByOpponent')
    })

    socket.on('resign', () => {
        if (!player_g || !game_g || !player_g.active_game_id){
            return
        }
        if (!opponent_g && !game_g.is_ai_game){
            return
        }
        stopGame('opponentResigned')
    })

    socket.on('drawRequest', () => {
        if (!player_g || !game_g || !opponent_g || !player_g.active_game_id){
            return
        }
        io.to(opponent_g.current_socket_id).emit('opponentDrawRequest', player_g.username)
    })

    socket.on('drawRequestAccepted', () => {
        stopGame('gameDrawn')
        socket.emit('gameDrawn')
    })

    socket.on('drawRequestDenied', () => {
        if (opponent_g){
            io.to(opponent_g.current_socket_id).emit('informDeniedDrawRequest')
        }
    })

    socket.on('selectionMade', (cell) => {
        const validated_cell = validatedCell(cell)
        if (validated_cell === false){
            const error = 'Validation error: invalid cell'
            socket.emit('consoleLogError', error)
            return
        }

        if (!player_g || !game_g || !player_g.active_game_id){
            return
        }
        if (!opponent_g && !game_g.is_ai_game){
            return
        }
        if (game_g.is_ai_game && (game_g.current_turn !== player_g.active_color)){
            return
        }

        const instructions = game_engine.getInstructionsForSelection(validated_cell, game_g, player_g.active_color)

        for (let instruction of instructions){
            const action = instruction.action

            if (action === 'updateSelection'){
                const { new_active_moves, new_last_selected_cell } = instruction.params
                games_db.updateGameSelection(game_g.id, player_g.active_color, new_active_moves, new_last_selected_cell)

            } else if (action === 'updateMove'){
                const { new_play, new_board } = instruction.params
                games_db.updateGameMove(game_g.id, player_g.active_color, new_play, new_board)

            } else if (action === 'activateBoard'){
                const { new_active_moves, new_last_selected_cell } = instruction.params
                socket.emit('activateBoard', [new_active_moves, new_last_selected_cell, player_g.active_color])

            } else if (action === 'deactivateBoard'){
                const deactivate_opponent = instruction.params
                if (deactivate_opponent && opponent_g){
                    io.to(opponent_g.current_socket_id).emit('deactivateBoard')
                }
                socket.emit('deactivateBoard')

            } else if (action === 'movePiece'){
                const new_play = instruction.params
                if (opponent_g){
                    io.to(opponent_g.current_socket_id).emit('movePiece', [new_play, opponent_g.active_color])
                }
                socket.emit('movePiece', [new_play, player_g.active_color])

            } else if (action === 'checkIfGameOver'){
                checkAndEmitGameOver(player_g.active_color)

            } else {
                console.log('Error evaluating actions from game-engine on server')
            }
        }

        requestAiMoveIfNeeded()
    })

    socket.on('aiMoveMade', ([from_cell, to_cell, promotion_type]) => {
        const validated_from_cell = validatedCell(from_cell)
        const validated_to_cell = validatedCell(to_cell)
        if ((validated_from_cell === false) || (validated_to_cell === false) || (validated_from_cell === null) || (validated_to_cell === null)){
            const error = 'Validation error: invalid AI move cells'
            socket.emit('consoleLogError', error)
            if (player_g && game_g && game_g.is_ai_game && (game_g.current_turn === game_g.ai_color)){
                applyAiMoveOrFallback(null, null, null)
            }
            return
        }

        let validated_promotion_type = null
        if (promotion_type){
            validated_promotion_type = validatedPromotionType(promotion_type)
            if (validated_promotion_type === false){
                const error = 'Validation error: invalid AI promotion type'
                socket.emit('consoleLogError', error)
                if (player_g && game_g && game_g.is_ai_game && (game_g.current_turn === game_g.ai_color)){
                    applyAiMoveOrFallback(validated_from_cell, validated_to_cell, null)
                }
                return
            }
        }

        if (!player_g || !game_g || !game_g.is_ai_game || !player_g.active_game_id){
            return
        }
        if (game_g.current_turn !== game_g.ai_color){
            return
        }

        applyAiMoveOrFallback(validated_from_cell, validated_to_cell, validated_promotion_type)
    })

    socket.on('aiMoveFailed', () => {
        if (!player_g || !game_g || !game_g.is_ai_game || !player_g.active_game_id){
            return
        }
        if (game_g.current_turn !== game_g.ai_color){
            return
        }

        applyAiMoveOrFallback(null, null, null)
    })

    socket.on('pawnPromotionTypeChosen', (type) => {
        const validated_type = validatedPromotionType(type)
        if (validated_type === false){
            const error = 'Validation error: invalid piece type'
            socket.emit('consoleLogError', error)
            return
        }
        
        if (!player_g || !game_g || !player_g.active_game_id){
            return
        }

        const unpromoted_pawn = games_db.getPawnEligibleForPromotion(player_g.active_game_id, player_g.active_color)
        const promoted_pawn = games_db.promotePawnAndReturnIt(player_g.active_game_id, player_g.active_color, validated_type)

        socket.emit('promotePawn', [unpromoted_pawn, promoted_pawn])
        if (opponent_g){
            io.to(opponent_g.current_socket_id).emit('promotePawn', [unpromoted_pawn, promoted_pawn])
        }

        checkAndEmitGameOver(player_g.active_color)
        requestAiMoveIfNeeded()
    })

    socket.on('disconnect', () => {
        removePlayer()
    })

    console.log('New Connection...')

});

server.listen(3000, () => console.log('Server running on port 3000'));
