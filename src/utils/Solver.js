class Solver {
    constructor(){
        this.DIGITS = '123456789'
        this.ROWS = "ABCDEFGHI"
        this.COLS = this.DIGITS
        this.BLANK_CHAR = '0'
        this.BLANK_BOARD = '000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        this.MIN_GIVENS = 17
        this.NR_SQUARES = 81
    }

    solve(board){
        // Init
        this.SQUARES = this._cross(this.ROWS, this.COLS)
        this.UNITS = this._get_all_units(this.ROWS, this.COLS)
        this.SQUARE_UNITS_MAP = this.get_square_units_map(this.SQUARES, this.UNITS)
        this.SQUARE_PEERS_MAP = this._get_square_peers_map(this.SQUARES, this.SQUARE_UNITS_MAP)

        // Check number of givens is at least MIN_GIVENS
        let nr_givens = 0
        for (let i in board) if (board[i] !== this.BLANK_CHAR) ++nr_givens
        if (nr_givens < this.MIN_GIVENS) return this.BLANK_BOARD

        let candidates = this._get_candidates_map(board);
        let result = this._search(candidates);
        
        if(result){
            let solution = "";
            for(let square in result){
                solution += result[square];
            }
            return solution;
        }
        return this.BLANK_BOARD;
    }

    get_candidates(board){
        // Get a candidates map
        let candidates_map = this._get_candidates_map(board)
                
        // If there's an error, return false
        if(!candidates_map) return false
        
        // Transform candidates map into grid
        let rows = []
        let cur_row = []
        let i = 0
        for(let square in candidates_map){
            let candidates = candidates_map[square]
            cur_row.push(candidates)
            if(i % 9 == 8){
                rows.push(cur_row)
                cur_row = []
            }
            ++i
        }
        return rows
    }

    _get_candidates_map(board){
        let candidate_map = {}
        let squares_values_map = this._get_square_vals_map(board)
        
        // Start by assigning every digit as a candidate to every square
        for(let si in this.SQUARES){
            candidate_map[this.SQUARES[si]] = this.DIGITS
        }
        
        // For each non-blank square, assign its value in the candidate map and
        // propigate.
        for(let square in squares_values_map){
            let val = squares_values_map[square]
            
            if(val, this.DIGITS.indexOf(val) !== -1){
                let new_candidates = this._assign(candidate_map, square, val)
                // Fail if we can't assign val to square
                if(!new_candidates) return false
            }
        }
        
        return candidate_map;
    }

    _search(candidates){
        // Return if error in previous iteration
        if(!candidates) return false

        // If only one candidate for every square, we've a solved puzzle!
        // Return the candidates map.
        let max_nr_candidates = 0;
        let max_candidates_square = null
        for(const si in this.SQUARES){
            let square = this.SQUARES[si]           
            let nr_candidates = candidates[square].length
            if(nr_candidates > max_nr_candidates){
                max_nr_candidates = nr_candidates
                max_candidates_square = square
            }
        }
        if(max_nr_candidates === 1) return candidates

        let min_nr_candidates = 10;
        let min_candidates_square = null;
        for(const si in this.SQUARES){
            let square = this.SQUARES[si];
            
            let nr_candidates = candidates[square].length;
            
            if(nr_candidates < min_nr_candidates && nr_candidates > 1){
                min_nr_candidates = nr_candidates;
                min_candidates_square = square;
            }
        }

        let min_candidates = candidates[min_candidates_square]
        for(const vi in min_candidates){
            let val = min_candidates[vi]
            let candidates_copy = JSON.parse(JSON.stringify(candidates))
            let candidates_next = this._search(this._assign(candidates_copy, min_candidates_square, val))
            if(candidates_next) return candidates_next
        }

        return false
    }

    _assign(candidates, square, val){
        let other_vals = candidates[square].replace(val, "")
        for(let ovi in other_vals){
            let other_val = other_vals[ovi]
            let candidates_next = this._eliminate(candidates, square, other_val)
            if(!candidates_next) return false
        }
        return candidates
    }

    _eliminate(candidates, square, val){
        if (candidates[square].indexOf(val) === -1) return candidates

        candidates[square] = candidates[square].replace(val, '')

        let nr_candidates = candidates[square].length
        if(nr_candidates === 1) for(let pi in this.SQUARE_PEERS_MAP[square]) if(!this._eliminate(candidates, this.SQUARE_PEERS_MAP[square][pi], candidates[square])) return false
        if(nr_candidates === 0) return false

        for(let ui in this.SQUARE_UNITS_MAP[square]){
            let unit = this.SQUARE_UNITS_MAP[square][ui]
            let val_places = []

            for(let si in unit){
                let unit_square = unit[si];
                if(candidates[unit_square].indexOf(val) !== -1) val_places.push(unit_square)
            }
            
            if(val_places.length === 0) return false
            else if(val_places.length === 1 && !this._assign(candidates, val_places[0], val)) return false
        }
        
        return candidates
    }

    _get_square_vals_map(board){
        let squares_vals_map = {}
        for(let i in this.SQUARES) squares_vals_map[this.SQUARES[i]] = board[i]
        return squares_vals_map
    }

    get_square_units_map(squares, units){
        let square_unit_map = {}
        for(let si in squares){
            let cur_square = squares[si]
            let cur_square_units = []
            for(let ui in units){
                let cur_unit = units[ui]
                if(cur_unit.indexOf(cur_square) !== -1) cur_square_units.push(cur_unit)
            }
            square_unit_map[cur_square] = cur_square_units
        }
        return square_unit_map
    }

    _get_square_peers_map(squares, units_map){
        let square_peers_map = {}
        for (let si in squares){
            let cur_square = squares[si]
            let cur_square_units = units_map[cur_square]
            let cur_square_peers = []
            for (let sui in cur_square_units){
                let cur_unit = cur_square_units[sui]
                for (let ui in cur_unit){
                    let cur_unit_square = cur_unit[ui]
                    if (cur_square_peers.indexOf(cur_unit_square) === -1 && cur_unit_square !== cur_square) cur_square_peers.push(cur_unit_square)
                }
            }
            square_peers_map[cur_square] = cur_square_peers
        }
        return square_peers_map
    }

    _get_all_units(rows, cols){
        let units = []
        for (let ri in rows) units.push(this._cross(rows[ri], cols))
        for (let ci in cols) units.push(this._cross(rows, cols[ci]))
        let row_squares = ["ABC", "DEF", "GHI"]
        let col_squares = ["123", "456", "789"]
        for (let rsi in row_squares) for (let csi in col_squares) units.push(this._cross(row_squares[rsi], col_squares[csi]))
        return units
    }

    _cross(a, b){
        let result = []
        for(let ai in a) for(let bi in b) result.push(a[ai] + b[bi])
        return result
    }

    _first_true(seq){
        for (let i in seq) if (seq[i]) return seq[i]
        return false
    }

    _strip_dups(seq){
        let seq_set = []
        let dup_map = {}
        for(let i in seq){
            let e = seq[i]
            if(!dup_map[e]){
                seq_set.push(e)
                dup_map[e] = true
            }
        }
        return seq_set
    }

    _force_range(nr, max, min){
        min = min || 0
        nr = nr || 0
        if(nr < min) return min
        if(nr > max) return max
        return nr
    }
}

export default new Solver()