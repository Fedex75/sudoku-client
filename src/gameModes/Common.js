import ClassicGame from "./ClassicGame"


function newGameFromMode(mode, data, raw){
    if (mode === 'classic') return new ClassicGame(data, raw);
    /*if (mode === 'classic') return new ClassicGame(data, raw);
    if (mode === 'classic') return new ClassicGame(data, raw);
    if (mode === 'classic') return new ClassicGame(data, raw);
    if (mode === 'classic') return new ClassicGame(data, raw);*/
}

export {
    newGameFromMode
}
