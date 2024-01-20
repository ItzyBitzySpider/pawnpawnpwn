import { Chess } from 'chess.js'

const FEN = "rnbqkb1r/1p2ppp1/3p4/p2n3p/3P4/3B1N2/PPP2PPP/RNBQK2R w KQkq - 0 7";
const chess = new Chess(FEN)
console.log(chess.ascii())

chess.put({})