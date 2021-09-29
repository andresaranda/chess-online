
class Piece {
    constructor(color) {
        this.color = color
    }
}

// '.has_not_moved' was used instead of '.has_moved' for convenience in later functions
class King extends Piece{
    constructor(color, id) {
        super(color)
        this.type = 'king'
        this.id = id
        this.has_not_moved = true
        this.cell = (color === 'white') ? [7, 4] : [0, 4]
    }
}

class Queen extends Piece{
    constructor(color, id) {
        super(color)
        this.type = 'queen'
        this.id = id
    }
}

class Rook extends Piece{
    constructor(color, id) {
        super(color)
        this.type = 'rook'
        this.id = id
        this.has_not_moved = true
    }
}

class Bishop extends Piece{
    constructor(color, id) {
        super(color)
        this.type = 'bishop'
        this.id = id
    }
}

class Knight extends Piece{
    constructor(color, id) {
        super(color)
        this.type = 'knight'
        this.id = id
    }
}

class Pawn extends Piece{
    constructor(color, id) {
        super(color)
        this.type = 'pawn'
        this.id = id
        this.has_moved_double = false
    }
}

function createPiece(type, color, id){
    let piece
    switch (type) {
        case 'king':
            piece = new King(color, id)
            break;
        case 'queen':
            piece = new Queen(color, id)
            break;
        case 'rook':
            piece = new Rook(color, id)
            break;
        case 'bishop':
            piece = new Bishop(color, id)
            break;
        case 'knight':
            piece = new Knight(color, id)
            break;
        case 'pawn':
            piece = new Pawn(color, id)
            break;
        default:
            piece = null
            break;
    }
    return piece
}


module.exports = createPiece