
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

    function stopGame(message_event){
        if (game_g){
            games_db.deleteGame(game_g.id)
        }
        game_g = null
        if (opponent_g){
            players_db.unlinkPlayerToGame(opponent_g.id)
            io.to(opponent_g.current_socket_id).emit(message_event)
            io.to(opponent_g.current_socket_id).emit('clearCache')
        }
        opponent_g = null
        if (player_g){
            players_db.unlinkPlayerToGame(player_g.id)
        }
    }

    function removePlayer(){
        stopGame('opponentLoggedOut')
        if (player_g){
            players_db.removeAwaitingPlayerIfIsCurrentPlayer(player_g.id)
            players_db.deletePlayer(player_g.id) // temporary, should be log out
        }
        player_g = null
    }

    socket.on('createPlayer', (username) => {
        // check username with schema

        const is_username_available = players_db.isUsernameAvailable(username)
        if (is_username_available){
            players_db.createPlayer(username, "", socket.id)
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
        // check color with schema
        if (!player_g){
            return
        }

        if (player_g.active_game_id){
            socket.emit('askIfCancelCurrentGame')
        } else {
            games_db.createGame(player_g.id)
            game_g = games_db.getGame(player_g.id)
            players_db.linkPlayerToGame(player_g.id, game_g.id, color)
            players_db.removeAwaitingPlayerIfIsCurrentPlayer(player_g.id)

            socket.emit('newGameCreated', [game_g.board, color])
        }
    })

    socket.on('joinGame', (opponent_username) => {
        // check username with schema
        if (!player_g){
            return
        }

        const possible_opponent_id = players_db.getPlayerIdFromUsername(opponent_username)
        if (possible_opponent_id === null){
            const error = `Username '${opponent_username}' does not exist, please provide a different one`
            socket.emit('joinGameError', error)

        } else {
            const possible_opponent = players_db.getPlayer(possible_opponent_id)
            if (possible_opponent.current_socket_id === null){
                const error = `${opponent_username} is currently not logged in`
                socket.emit('joinGameError', error)

            } else if (possible_opponent.active_game_id === null){
                const error = `${opponent_username} hasn't started a game yet, to start a game press New Game`
                socket.emit('joinGameError', error)

            } else if (possible_opponent.active_opponent !== null){
                const error = `${opponent_username} is already in an active game`
                socket.emit('joinGameError', error)

            } else {
                if (player_g.active_game_id){
                    socket.emit('askIfCancelCurrentGame')
                } else {
                    io.to(possible_opponent.current_socket_id).emit('joinGameRequest', player_g.username)
                }
            }
        }
        
    })

    socket.on('confirmJoin', (opponent_username) => {
        // check username with schema
        if (!player_g || !game_g){
            return
        }

        const possible_opponent_id = players_db.getPlayerIdFromUsername(opponent_username)
        const possible_opponent = players_db.getPlayer(possible_opponent_id)
        if (player_g.active_game_id && !player_g.active_opponent && !possible_opponent.active_game_id){
            const opponent_color = (player_g.active_color === 'white') ? 'black' : 'white'
            players_db.linkPlayerToGame(possible_opponent.id, game_g.id, opponent_color)
            players_db.linkPlayersTogether(player_g.id, possible_opponent.id)
            
            socket.emit('joinGameSuccessful', possible_opponent.username)
            io.to(possible_opponent.current_socket_id).emit('newGameJoined', [game_g.board, possible_opponent.active_color])
            io.to(possible_opponent.current_socket_id).emit('joinGameSuccessful', player_g.username)
        }
    })

    socket.on('ignoreJoin', (opponent_username) => {
        // check username with schema

        const possible_opponent_id = players_db.getPlayerIdFromUsername(opponent_username)
        if (possible_opponent_id){
            const possible_opponent = players_db.getPlayer(possible_opponent_id)

            const error = "Join request was denied by player"
            io.to(possible_opponent.current_socket_id).emit('joinGameError', error)
        }
    })

    socket.on('randomGame', (color) => {
        // check color with schema
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
                players_db.linkPlayerToGame(player_g.id, player_g.id, color)

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
        if (!player_g || !game_g || !opponent_g || !player_g.active_game_id){
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

        // check cell with schema and boundry conditions
        if (!player_g || !game_g || !opponent_g || !player_g.active_game_id){
            return
        }

        const instructions = game_engine.getInstructionsForSelection(cell, game_g, player_g.active_color)

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
                if (deactivate_opponent){
                    io.to(opponent_g.current_socket_id).emit('deactivateBoard')
                }
                socket.emit('deactivateBoard')

            } else if (action === 'movePiece'){
                const new_play = instruction.params
                io.to(opponent_g.current_socket_id).emit('movePiece', [new_play, opponent_g.active_color])
                socket.emit('movePiece', [new_play, player_g.active_color])

            } else if (action === 'checkIfGameOver'){
                const game_over_state = game_engine.getGameOverState(game_g, player_g.active_color)

                if (game_over_state === 'checkmate'){
                    socket.emit('gameOverByCheckmateWon')
                    stopGame('gameOverByCheckmateLost')

                } else if (game_over_state === 'stalemate'){
                    socket.emit('gameOverByStalemate')
                    stopGame('gameOverByStalemate')

                } else if (game_over_state === 'deadPosition'){
                    socket.emit('gameOverByDeadPosition')
                    stopGame('gameOverByDeadPosition')

                }

            } else {
                console.log('Error evaluating actions from game-engine on server')
            }
        }
    })

    socket.on('pawnPromotionTypeChosen', (type) => {
        // check type with schema
        if (!player_g || !game_g || !player_g.active_game_id){
            return
        }

        const unpromoted_pawn = games_db.getPawnEligibleForPromotion(player_g.active_game_id, player_g.active_color)
        const promoted_pawn = games_db.promotePawnAndReturnIt(player_g.active_game_id, player_g.active_color, type)

        socket.emit('promotePawn', [unpromoted_pawn, promoted_pawn])
        if (opponent_g){
            io.to(opponent_g.current_socket_id).emit('promotePawn', [unpromoted_pawn, promoted_pawn])
        }
    })

    socket.on('disconnect', () => {
        removePlayer()
    })

    console.log('New Connection...')

});

server.listen(3000, () => console.log('Server running on port 3000'));
