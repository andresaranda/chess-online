
const active_players = {}
let awaiting_player_id = null

class Player {
    constructor(id, username, password, current_socket_id) {
        this.id = id,
        this.username = username,
        this.password = password,
        this.active_game_id = null,
        this.active_opponent = null,
        this.active_color = null,
        this.current_socket_id = current_socket_id
    }
}

function getPlayerIdFromUsername(username){
    for (let player_id in active_players){
        if (active_players[player_id]?.username === username){
            return player_id
        }
    }
    return null
}

function getPlayerIdFromSocketId(current_socket_id){
    for (let player_id in active_players){
        if (active_players[player_id]?.current_socket_id === current_socket_id){
            return player_id
        }
    }
    return null
}

function getPlayer(id){
    return active_players[id]
}

function getAwaitingPlayerIdOrQueueCurrentPlayer(current_player_id){
    if (awaiting_player_id && (current_player_id !== awaiting_player_id)){
        const opponent_id = awaiting_player_id
        awaiting_player_id = null
        return opponent_id
    } else {
        awaiting_player_id = current_player_id
        return null
    }
}

function removeAwaitingPlayerIfIsCurrentPlayer(current_player_id){
    if (awaiting_player_id === current_player_id){
        awaiting_player_id = null
    }
}

function isUsernameAvailable(username){
    return !getPlayerIdFromUsername(username)
}

function generateRandomUsername(){
    let number
    let username
    do {
        number = Math.floor(1000 + Math.random() * 9000)
        username = `Player${number}`
    } while (!isUsernameAvailable(username))

    return username
}

function generateRandomId(){
    let number
    do {
        number = Math.floor(10000 + Math.random() * 90000)
    } while (Object.keys(active_players).includes(`${number}`))

    return number
}

// creates a new player and returns it
function createPlayer(username, password, current_socket_id){
    let checked_username = username

    if (username === 'random'){
        checked_username = generateRandomUsername()
    }

    const id = generateRandomId()

    const new_player = new Player(id, checked_username, password, current_socket_id)
    active_players[id] = new_player
}

function deletePlayer(id){
    delete active_players[id]
}

function linkPlayerToGame(player_id, active_game_id, active_color){
    const player = getPlayer(player_id)
    player.active_game_id = active_game_id
    player.active_color = active_color
}

function linkPlayersTogether(player_1_id, player_2_id){
    const player_1 = getPlayer(player_1_id)
    const player_2 = getPlayer(player_2_id)
    player_1.active_opponent = player_2_id
    player_2.active_opponent = player_1_id
}

function unlinkPlayerToGame(player_id){
    const player = getPlayer(player_id)
    if (player){
        player.active_game_id = null
        player.active_opponent = null
        player.active_color = null
    }
}

module.exports = {
    getPlayerIdFromUsername,
    getPlayerIdFromSocketId,
    getPlayer,
    getAwaitingPlayerIdOrQueueCurrentPlayer,
    removeAwaitingPlayerIfIsCurrentPlayer,
    isUsernameAvailable,
    createPlayer,
    deletePlayer,
    linkPlayerToGame,
    linkPlayersTogether,
    unlinkPlayerToGame
}