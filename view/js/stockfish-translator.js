
function getFenCharFromPiece(piece){
    const fen_chars = {
        white: { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: 'P' },
        black: { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p' }
    }
    return fen_chars[piece.color][piece.type]
}

function getFenBoardSegment(board){
    const fen_rows = []

    for (let y = 0; y < 8; y++){
        let fen_row = ''
        let empty_count = 0

        for (let x = 0; x < 8; x++){
            const piece = board[y][x]
            if (piece === null){
                empty_count += 1
            } else {
                if (empty_count > 0){
                    fen_row += String(empty_count)
                    empty_count = 0
                }
                fen_row += getFenCharFromPiece(piece)
            }
        }

        if (empty_count > 0){
            fen_row += String(empty_count)
        }
        fen_rows.push(fen_row)
    }

    return fen_rows.join('/')
}

function getFenCastlingSegment(board){
    let castling = ''

    const white_king = board[7][4]
    if (white_king?.type === 'king' && white_king.has_not_moved){
        if (board[7][7]?.type === 'rook' && board[7][7].has_not_moved){
            castling += 'K'
        }
        if (board[7][0]?.type === 'rook' && board[7][0].has_not_moved){
            castling += 'Q'
        }
    }

    const black_king = board[0][4]
    if (black_king?.type === 'king' && black_king.has_not_moved){
        if (board[0][7]?.type === 'rook' && board[0][7].has_not_moved){
            castling += 'k'
        }
        if (board[0][0]?.type === 'rook' && board[0][0].has_not_moved){
            castling += 'q'
        }
    }

    return castling || '-'
}

function cellToAlgebraic(cell){
    const board_files = 'abcdefgh'
    const file = board_files[cell[1]]
    const rank = String(8 - cell[0])
    return file + rank
}

function algebraicToCell(algebraic){
    const board_files = 'abcdefgh'
    const x = board_files.indexOf(algebraic[0])
    const y = 8 - parseInt(algebraic[1])
    return [y, x]
}

function getEnPassantTargetCellFromBoard(board){
    for (let y = 0; y < 8; y++){
        for (let x = 0; x < 8; x++){
            const piece = board[y][x]
            if (piece?.type === 'pawn' && piece.has_moved_double){
                const en_passant_y = (piece.color === 'white') ? (y + 1) : (y - 1)
                return [en_passant_y, x]
            }
        }
    }
    return null
}

function getFenEnPassantSegment(en_passant_cell){
    if (!en_passant_cell){
        return '-'
    }
    return cellToAlgebraic(en_passant_cell)
}

function boardToFen(board, current_turn){
    const board_segment = getFenBoardSegment(board)
    const turn_segment = (current_turn === 'white') ? 'w' : 'b'
    const castling_segment = getFenCastlingSegment(board)
    const en_passant_segment = getFenEnPassantSegment(getEnPassantTargetCellFromBoard(board))
    return `${board_segment} ${turn_segment} ${castling_segment} ${en_passant_segment} 0 1`
}

function uciMoveToCellsAndPromotion(uci_move){
    const from_cell = algebraicToCell(uci_move.slice(0, 2))
    const to_cell = algebraicToCell(uci_move.slice(2, 4))
    const promotion_chars = { q: 'queen', r: 'rook', b: 'bishop', n: 'knight' }
    const promotion_type = uci_move[4] ? promotion_chars[uci_move[4]] : null
    return { from_cell, to_cell, promotion_type }
}

function getSkillLevelFromDifficulty(difficulty){
    const skill_levels = { easy: 2, medium: 9, hard: 17 }
    return skill_levels[difficulty]
}

function getMoveTimeFromDifficulty(difficulty){
    const move_times = { easy: 300, medium: 600, hard: 1000 }
    return move_times[difficulty]
}
