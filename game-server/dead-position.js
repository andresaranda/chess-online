
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

module.exports = {
    isGameInDeadPosition
}
