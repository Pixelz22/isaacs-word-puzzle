const WORD_LENGTH = 5;

let HISTORY = [];

let VALID_WORDS = new Set();

let STARTING_WORD;
let TARGET_WORD;

export function resetGame(startWord, targetWord) {
    STARTING_WORD = startWord;
    TARGET_WORD = targetWord;
    HISTORY = [];
}

export function loadWordList() {
    return fetch("https://raw.githubusercontent.com/tabatkins/wordle-list/main/words").then((response) => {
        return response.text();
    }).then((data) => {
        data.toUpperCase().split("\n").forEach((word) => {VALID_WORDS.add(word)});
    });
}

export function assertValidWord(word) {
    return word.length === WORD_LENGTH && VALID_WORDS.has(word);
}

// returns index of changed letter
export function checkForLetterChange(start, move) {
    let letterChange = -1;
    for (let i = 0; i < WORD_LENGTH; i++) {
        if (start[i] !== move[i]) {
            if (letterChange >= 0)
                return -1; // two letters different
            letterChange = i;
        }
    }

    return letterChange;
}

export function checkForAnagram(start, move) {
    // then check for anagram
    let startAnalysis = new Array(26).fill(0);
    let moveAnalysis = new Array(26).fill(0);

    const charCodeA = "A".charCodeAt(0);

    for (let i = 0; i < WORD_LENGTH; i++) {
        startAnalysis[start.charCodeAt(i) - charCodeA]++;
        moveAnalysis[move.charCodeAt(i) - charCodeA]++;
    }

    let diff = 0;
    for (let i = 0; i < 26; i++)
        if (startAnalysis[i] !== moveAnalysis[i]) return false;

    return true;
}

export { HISTORY, STARTING_WORD, TARGET_WORD };