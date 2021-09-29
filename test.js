const active_players_1 = {}
const active_players_2 = {12345:{a:3, b:4}}
function generateRandomId(){
    let number
    do {
        number = Math.floor(10000 + Math.random() * 90000)
    } while (Object.keys(active_players_2).includes(`${number}`))

    return number
}
console.log(generateRandomId())

/* const games = require('./utils/games')
games.createGame(12345)
const game = games.getGame(12345)

const threatened_cells = []
const possible_moves = [{cell: [5, 3], piece: 5}, {cell: [6, 8], piece: 8}]
const filtered_moves = possible_moves.filter((possible_move) => {
    const [yp, xp] = possible_move.cell
    for (let threatened_cell of threatened_cells){
        const [yt, xt] = threatened_cell
        if ((yp === yt) && (xp === xt)){
            return false
        } else {
            return true
        }
    }
})
console.log(filtered_moves)

function isOutOfBounds(cell_x, cell_y){
    //((!x_inc || ((0 <= cellx) && (cellx < 8))) && (!y_sign || ((0 <= celly) && (celly < 8))))
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

function getThreateningAdjacentKing(cell, board, player_color){
    const [cell_y, cell_x] = cell
    for (let x of [-1, 0, 1]){
        for (let y of [-1, 0, 1]){
            // 0, 0 will check the current cell, but will evaluate to false as it is a piece of the same color
            const target_cell = [cell_y + y, cell_x + x]
            const move = evaluateMove(target_cell, board, player_color)
            if (move.is_possible && (move.piece?.type === 'king') && (move.piece?.color !== player_color)){
                return [{cell: target_cell, piece: move.piece}]
            }
        }
    }
    return []
}

const attacking_king = getThreateningAdjacentKing([1, 4], game.board, 'white')
//console.log(attacking_king)

function filterPossibleMovesForType(possible_moves, searched_type){
    return possible_moves.filter((possible_move) => {return (possible_move.piece?.type === searched_type)})
}

const possible = [ { cell: [ 5, 3 ], piece: null }, { cell: [ 5, 5 ], piece: null } ]
const ans = filterPossibleMovesForType(possible, 'queen')
//console.log(ans) */

/* const arraytest = [5, 4]
const newarray = arraytest.slice()
newarray[0] += 1
console.log(arraytest, newarray) */

/* const x = null
const y = x?.type
console.log(y) */

/* const games = require('./utils/games')

const arry = [3, 4]
games.createGame(54645645)
const game = games.getGame(54645645)
const result = game.board[3][4]
console.log(result) */

/* function c(){
    return {a: 5, b: 6}
}

const {a,b} = c()
console.log(a,b) */

/* let {a, b, c}
a = 5
b = 6
c = 7
console.log(a) 'DOES NOT WORK' */

/* const possible_colors = {newgame: 'white', 'new-game-color-random': 'random', 'new-game-color-black': 'black'}
const id = possible_colors['new-game-color-random']
const od = possible_colors['newgame']
console.log(id)
console.log(od) */

/* function c(){
    return { a: 5, b: 8 }
}
const { a: aa, b: bb } = c()
console.log(aa, bb) */

/* class Piece {
    constructor(color) {
        this.color = color
    }
}

// '.has_not_moved' was used instead of '.has_moved' for convenience in later functions
class King extends Piece{
    constructor(color) {
        super(color)
        this.type = 'king'
        this.id = this
        this.has_not_moved = true
        this.cell = (color === 'white') ? [7, 4] : [0, 4]
    }
}

const Kw = new King('black')
console.log(Kw)  'DOES NOT WORK' */

/* const games = require('./utils/games')
const game = games.createGame(5645656)
console.log(game) */

/* const createPiece = require('./utils/pieces')

function createGame(){

    const game = {}

    const Kw = createPiece('king', 'white', 'Kw')
    game.k = {a: Kw, b: 3}

    game.white = {
        king = Kw,
    }

    return game
}

const c = createGame()
console.log(c) */

/* const createPiece = require('./utils/pieces')

const pp = createPiece('queen', 'white', 'Qw')

const board = [[3, 5], [8, pp]]
console.log(board) */

/* const obj = {a: 5, b: 3}
const c = obj?.d || null
const e = null || undefined
console.log(e) */

/* let y = [3, 5]
for (let x = 0; x < 5; x++){
    y[0] += 1
}
console.log(y) */

/* let go = ['wer', 'frt']
let fo = []
let so = fo.length
console.log(so) */

/* let play
const pray = []
if (pray){
    console.log('work')
}
const board = [[2, 3], [4, 5]]
const selected_move = {a: 3, b: 4, en_passant_captured_cell: [0, 1]}
const en_passant_cell = selected_move?.en_passant_captured_cell
const en_passant_piece = en_passant_cell ? board[en_passant_cell[0]][en_passant_cell[1]] : undefined
console.log(en_passant_piece, en_passant_cell, play) */

/* function abc(x, y, z){
    return value = {
        d: {
            e1: x,
            e2: y
        },
        f: {
            e3: z[x]
        }
    }
}

const xx = 2
const yy = {dog: 6}
const zz = [7, 8, 9]
console.log(abc(xx, yy, zz)) */

/* const array1 = [5, 3, [4, 6], [7, 8]]
const block = array1.slice(-1)[0]
console.log(block) */

/* const valu1 = 5
const valu2 = 3
const obj = {valu1, valu2: 4}
console.log(obj)
if (obj){
    console.log('works')
} */

/* function getMain(letter){
    const main_obj = {a: {b: 4, c: 6}, d: {a: 1, e: 3}}
    return main_obj[letter]
}

function modifyMain(letter){
    const obj = getMain(letter)
    return obj
}

const obj = modifyMain('a')
obj.c = 10
console.log(getMain('a')) */

/* function adding(a, b){
    return a + b
}

c = {f: 5, h: 10}
console.log(adding(c.f, c.h)) */

/* const color = (Math.random() < 0.5) ? 'white' : 'black'
console.log(color) */

/* user = {id1: {a: 5, b: 6}, id2: {c: 4, d: 3}}

for (let u in user){
    console.log(u)
} */

/* class Piece {
    constructor(color) {
        this.color = color
    }
}

// '.has_not_moved' was used instead of '.has_moved' for convenience in later functions
class King extends Piece{
    constructor(color) {
        super(color)
        this.type = 'king'
        this.id = `K${color[0]}`
        this.has_not_moved = true
        this.cell = (color === 'white') ? [7, 4] : [0, 4]
    }
}

function createPiece(color, price){
    let Kww = new King(color)
    return Kww
}

const Kw = createPiece('white')
const white_king = Kw
white_king.has_not_moved = false

console.log(Kw)

const obj = {}
obj.k = 'king'

console.log(obj)

const cell = [2, 3]
cell[0] += 1
console.log(cell) */

/* x_cell1 = 2
x_cell2 = 8
const [x_min, x_max] = (x_cell2 > x_cell1) ? [(x_cell1 + 1), (x_cell2 - 1)] : [(x_cell2 + 1), (x_cell1 - 1)]
console.log(x_min)

y_min = 5
y_max = 5
for (let i = y_min; i <= y_max; i++){
    console.log('works')
} */

/* const threatening_moves = []
const threat = threatening_moves[0]
console.log(threat) */

/* let cell = [5 ,3]
const [x, y] = cell
let z = x + y
console.log(z, x, y)
y_inc = -1
x_inc = -1
y_king = 9
x_king = 1
const slope = y_inc / x_inc
const constant = y_king - (x_king * slope)
console.log(slope, constant) */

/* let array1 = [{k: 'fi', g: 5}, {k: 'di', g: 7}]
let array2 = [{k: 'si', g: 2}, {k: 'wi', g: 1}]
const arraytot = [...array1, ...array2]
console.log(arraytot) */

/* let block_threat_moves = []
let possible_moves = [{cell: [5, 3], piece: 'Q'}, {cell: [1, 1], piece: 'K'}, {cell: [7, 8], piece: 'R'}]
let blocking_cells = [[1, 4], [5, 3], [7, 8]]

for (let possible_move of possible_moves){
    for (let blocking_cell of blocking_cells){
        if ((possible_move.cell[0] === blocking_cell[0]) && (possible_move.cell[1] === blocking_cell[1])){
            block_threat_moves.push(possible_move)
        }
    }
}

console.log(block_threat_moves) */

/* let possible_moves = [{cell: [5, 3], piece: 'Q'}, {cell: [1, 1], piece: 'K'}, {cell: [7, 8], piece: 'R'}]
let blocking_cells = [[1, 4], [5, 3], [7, 8]]
var hash = {};
for(var i = 0 ; i < blocking_cells.length; i += 1) {
    hash[blocking_cells[i]] = i;
}
let block_threat_moves = possible_moves.filter((possible_move) => hash.hasOwnProperty(possible_move.cell))
console.log(block_threat_moves) */

/* function getIncrementerBetweenTwoCellsInSameRowColOrDiagFrom1To2(cell_1, cell_2){
    y = cell_2[0] - cell_1[0]
    x = cell_2[1] - cell_1[1]
    y_inc = (y === 0) ? 0 : y/Math.abs(y)
    x_inc = (x === 0) ? 0 : x/Math.abs(x)
    return [y_inc, x_inc]
}

[y, x] = getIncrementerBetweenTwoCellsInSameRowColOrDiagFrom1To2([5, 5], [8, 5])
console.log(y, x) */

/* const val = -5
console.log(val/Math.abs(val)) */

/* val = [{cell: [5, 3], piece: 5}, {cell: [6, 4], piece: 7}]
val = null
if (!val){
    console.log('case 1')
} else {
    console.log('case 2')
} */

/* class Piece {
    constructor(color) {
        this.color = color
    }
}

class King extends Piece{
    constructor(color) {
        super(color)
        this.type = 'king'
        this.id = `K${color[0]}id`
        this.has_not_moved = true
        this.cell = (color === 'white') ? [7, 4] : [0, 4]
    }
}

let Kw = new King('white')
let Kb = new King('black')
let white_king = Kw
let black_king = Kb

function createPiecesObject(pieces_array){
    let pieces_object = {}
    pieces_array.forEach((piece) => {pieces_object[piece.id] = piece})
    return pieces_object
}

let white_pieces_alive = createPiecesObject([Kw, Kb])

let board = [Kw, Kb, 3]
let piece = board[0]
let move = {is_possible: 'is_possible', piece: piece}
let possible_cells = [{cell: 'target_cell', piece: move.piece}]
//console.log(white_pieces)
console.log(Object.keys(white_pieces_alive))
console.log(Object.keys(white_pieces_alive).length)
let target_id = possible_cells[0].piece.id
//console.log(white_pieces[target_id].has_not_moved)
delete white_pieces_alive[target_id]
console.log(Object.keys(white_pieces_alive))
console.log(Object.keys(white_pieces_alive).length)
function len(obj){return Object.keys(obj).length}
console.log(len(white_pieces_alive)) */

/* function isKingInCheck(board, player_color){return true}
function canPlayerMove(board, player_color){return false}

function isStalemate(board, player_color, is_in_check_optional = undefined){
    const is_king_in_check = (is_in_check_optional === undefined) ? isKingInCheck(board, player_color) : is_in_check_optional
    if (!canPlayerMove(board, player_color) && !is_king_in_check){
        return true
    }
    return false
}

console.log(isStalemate(true, true)) */

/* class Piece {
    constructor(color) {
        this.color = color
    }
}

class King extends Piece{
    constructor(color) {
        super(color)
        this.type = 'king'
        this.id = `K${color[0]}`
        this.has_not_moved = true
        this.cell = (color === 'white') ? [7, 4] : [0, 4]
    }
}

let Kw = new King('white')
let white_king = Kw

let board = [Kw, 5, 3]
let piece = board[0]
let move = {is_possible: 'is_possible', piece: piece}
let possible_cells = [{cell: 'target_cell', piece: move.piece}]
//console.log(possible_cells[0].piece.type)
console.log(possible_cells[0].piece.cell)
possible_cells[0].piece.cell = [5, 5]
console.log(possible_cells[0].piece.cell)
white_king.cell = [6, 6]
console.log(possible_cells[0].piece.cell)
console.log(possible_cells[0].piece.id) */

/* function Piece(x, y, z){
    this.x = x
    this.val2 = [x, y]
    this.val3 = z ? true : false
}

function Pawn(x, y, z, a, b){
    this.val4 = a * a
    Piece.apply(this, [x, y, z])
    this.val5 = b - a
}

//Pawn.prototype = Object.create(Piece.prototype)
//Pawn.prototype.constructor = Pawn

let obj1 = new Pawn(1, 2, 3, 4, 5)
let move = {cell: [2, 3], piece: obj1}
console.log(obj1.x, obj1.val2, obj1.val3, obj1.val4, obj1.val5)
console.log(move.piece.val3)
//console.log(move)
//console.log(Object.getPrototypeOf(Pawn))
//console.log(Object.getPrototypeOf(Piece)) */

/* class Piece {
    constructor(x, y, z) {
        this.val1 = x
        this.val2 = [x, y]
        this.val3 = z ? true : false
    }
}

class Pawn extends Piece{
    constructor(x, y, z, a, b) {
        super(x, y, z)
        this.val4 = a * a
        this.val5 = b - a
    }
}

//let obj1 = new Obj(5, 3, null)
//let thing = {item: obj1, id: 5}

let obj1 = new Pawn(1, 2, 3, 4, 5)
console.log(obj1.val1, obj1.val2, obj1.val3, obj1.val4, obj1.val5) */

/* function adding(x, y){
    return (x + y)
}

function multiplying(x, y){
    return (x * y)
}

function Obj(x, y){
    this.add = adding(x, y)
    //this.mult = multiplying(x, y)
    this.val1 = 'value1'
    this.val2 = [x, y]
    this.val3 = false
}

Obj.prototype.mult = function(x, y){return (x*y)}

let obj = new Obj(5, 3)

let thing = {item: obj, id: 5}

console.log(obj)
console.log(obj.add, obj.mult, obj.val1, obj.val2, obj.val3)
console.log(thing.item)
console.log(thing.item.val2)
obj.val1 = 'modified'
obj.val2[0] += 2
obj.val3 = true
console.log(obj)
console.log(obj.add, obj.mult, obj.val1, obj.val2, obj.val3)
console.log(thing.item)
console.log(thing.item.val1)
console.log(Object.getPrototypeOf(obj))
console.log(adding.prototype)

let pw8 = {type: 'pawn', color: 'white', position: 8, has_moved_double: false}
console.log(pw8) */

/* if (undefined === 'rook'){
    console.log('works')
} else {
    console.log('works too')
} */

/* board = [['pb1', 'pb2', 'pb3', 'pb4', 'pb5', 'pb6', 'pb7', 'pb8'], 
[null, null, null, null, null, null, null, null]]
console.log(board) */

/* function test(){
    move = {is_possible: true, piece: {type: 'rook', color: 'black'}}
    return !move.piece
} */

/* function test(var1, var2, var3){
    total = var1 + var2 + var3
    return total
}

t = test(2, 5, var3 = 3)
console.log(t)
console.log(var3) */

/* if (51<10 || 14<8 || 9<60){
    val = 'works'
} else {
    val = 'does not work'
}
console.log(val) */

/* let arry = []
for (let x of [1,2,3]){
    const y = x + 3
    arry.push(y)
}
console.log(arry) */

/* const obj1 = {k: 'v1', m: 'v2'}
let obj2 = obj1
obj2.j = 'x3'
console.log(obj1, obj2) */

/* obj1 = {key1: 'val1', key2: 'val2'}
obj2 = {key1: 'val3'}
obj3 = null

if (obj3?.key2){
    value = 'yes'
} else {
    value = 'no'
}
console.log(value) */

/* d = undefined
c = 5
if (c && d){
    console.log('works')
} else {
    console.log('doesnt work')
} */

/* obj = {}
arry = [1,2,3]
arry.push(obj) //ERROR if ...obj is used
console.log(arry) */

/* obj = {cat: 'kitty', dog: 'doggy'}
if (!obj && 3<10){
    console.log('works')
} else console.log('also works') */

/* arry = []
arr1 = []
arr2 = []
arry.push(...arr1, ...arr2)
console.log(arry) */

/* obj1 = {name: 'dog', age: 5}
obj2 = {name: 'cat', age: 8}
pets = [obj1, obj2]

pet2 = pets[1]
console.log(pets)

function changeAge(pet){
    pet.age += 1
}

changeAge(pet2)

console.log(pets) */

/* function isOutOfBounds(cell_x, cell_y){
    if (((cell_x < 0) || (8 <= cell_x)) || ((cell_y < 0) || (8 <= cell_y))) { //check bounds
        return true
    } else {
        return false
    }
}

function evaluateMove(cell_x, cell_y){
    if (isOutOfBounds(cell_x, cell_y)) { //check bounds
        return 'out of bounds', 5
    } else return 'inside bounds', 'and this'
}

move = evaluateMove(5,3)
console.log(move) */

/* for (let i = 1; i<=8; i++){
    eval(`pw${i} = {type: 'pawn', color: 'white', position: ${i}, en_passant: false}`)
}
console.log(pw1, pw7, pw8)
console.log(pw8.color) */

/* pieces_array = []
for (let i = 1; i<=8; i++){
    new_pawn = eval(`pw${i} = {type: 'pawn', color: 'white', position: ${i}, en_passant: false}`)
    pieces_array.push(new_pawn)
}
console.log(pw6)
console.log(pieces_array[4])
console.log(pieces_array[2].position) */

/* objarry = [{cat: 'kitty', dog: 'puppy'}, {cat: 'meow', dog: 'wuf'}, {cat: 5, dog: true}]
console.log(objarry) */

/* for (let x of [1, 2]){
    let y = (x === 1) ? 2 : 1
    console.log(x, y)
} */

/* Kb = {type: 'king', color: 'black'}
Qb = {type: 'queen', color: 'black'}
Nw = {type: 'knight', color: 'white'}
x = null

let board = [Kb, Qb, Nw, x]
test = (board[3] === null) ? true : false
console.log(test) */

/* let cell = [6, 3]
for (let x = 1; x <= 2; x++){
    let y = (x === 1) ? 2 : 1
    for (let x_sign = -1; x_sign <= 1; x_sign += 2){
        for (let y_sign = -1; y_sign <= 1; y_sign += 2){
            let pos_cell = [(cell[0] + y * y_sign),(cell[1] + x * x_sign)]
            console.log(pos_cell)
        }
    }
} */

/* let cell = [5,6]

cell[1] += 3
cell[0] += 2

console.log(cell) */

/* let counter = 0

function isMovePosible(){
    counter += 1
    if (counter < 3){
        return true
    } else {
        return false
    }
}

do {

    let is_posible = isMovePosible()
    console.log('it works')
    
} while (is_posible) */

/* for (i=1;i<2;++i){
    console.log('yo')
} */

/* testboard = [[1,2],[3,4],[5,6]]

console.log(testboard[2][9]) */

/* cell = [5,6]

cell[0] = cell[0] + 1
cell = [cell[0]+2, cell[1]]

console.log(cell) */

/* let texty = 'text'
console.log(texty[2]) */

/* let white_team = ['Kw','Qw']
let black_team = ['Kb','Qb']
let player = 'white'
let player_team = (player === 'white') ? white_team : black_team
console.log(player_team) */

/* let obj = {
    key1: 'var1',
    key2: 'var2',
    key3: {
        key31: 'var31',
        key32: 'var32'
    }
};

let {key1:v1,key2:v2,key3:{key31:v31,key32:v32}} = obj;

console.log(v1,"  ",v2,"  ",v31," ",v32); */