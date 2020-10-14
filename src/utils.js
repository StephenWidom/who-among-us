export const isHost = (id, players) => {
    return !players.some(player => player.id === id);
};

export const getMe = (id, players) => {
    return players.find(player => player.id === id);
}

export const promptSubmitted = (id, players) => {
    const me = getMe(id, players);
    if (typeof me === 'undefined')
        return false;

    return me.promptSubmitted;
}

export const allPromptsComplete = players => {
    // Make sure to only check players who are connected
    const activePlayers = players.filter(player => player.connected);
    return activePlayers.every(player => player.promptSubmitted);
}

export const allGuessesMade = players => {
    const activePlayers = players.filter(player => player.connected);
    return activePlayers.every(player => player.guessSubmitted);
}

export const isInGame = (id, players) => {
    return players.some(player => player.id === id);
}

export const getScore = (answer, guess, round = 1) => {
    const intGuess = parseInt(guess, 10);

    if (round === 1) {
        if (answer === intGuess) {
            return 300;
        }

        if (Math.abs(answer - intGuess) <= 2) {
            return 100;
        }

        return 0;

    } else { // Scoring is more intense for round 2
        if (answer ===  intGuess)
            return 400;

        if (Math.abs(answer - intGuess <= 1))
            return 150;

        return -100;
    }
}

export const getWinner = players => {
    const winningScore = players[0].score;
    const winners = players.filter(p => p.score === winningScore);
    if (winners.length === 1)
        return `${winners[0].name} wins!`;

    let message = '';
    winners.forEach(p => {
        message += `${p.name} and `;
    });
    message.slice(0, -5);

    return `${message} win!`;

}

export const getPlayersButMe = (id, players) => players.filter(p => p.id !== id);

export const examplePrompts = [
    'never broke a bone',
    'pissed themselves in the last year',
    'speaks more than one language',
    'has had sex in a car',
    'has ever waxed, shaved, or bleached their asshole',
    'watched porn in the last 24 hours',
    'flashed someone',
    'has had a threesome',
    'likes licorice',
    'ate fast food this week',
    'has ever sent or received a dick pic',
    'cheated on a test in school',
    'has ever slept with someone ten years older',
    'knows the capital of West Virginia',
    'has seen The Godfather',
    "has had someone else's finger in their butt",
    "jizzed at a friend's house",
    "would eat a pencil for $10,000",
    "has lied about their age to a romantic interest",
    "woke up next to a stranger",
];

