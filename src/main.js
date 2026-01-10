let WORD_INPUT = document.getElementById("wordInput");
let INPUT_CONTAINER = document.getElementById("inputContainer");

const WORD_LENGTH = 5;

const WORD_DISPLAY_OFFSET = -100; // in px

let STARTING_WORD = "GRAVE";
let HISTORY = [];

let VALID_WORDS = new Set();

// returns index of changed letter
function checkForLetterChange(start, move) {
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

function checkForAnagram(start, move) {
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

function formatHistory() {
    let historyContainer = document.getElementById("historyContainer");

    // update positions
    let historyList = historyContainer.children;
    let counter = historyList.length;
    for (let child of historyList) {
        child.style.top = (WORD_DISPLAY_OFFSET * counter) + "px";
        counter--;
    }
}

function badSubmit() {
    INPUT_CONTAINER.style.animation = "none";
    setTimeout(() => {
        INPUT_CONTAINER.style.animationComposition = "accumulate";
        INPUT_CONTAINER.style.animation = "NoSubmit 0.5s";
    });
}

function constructWordDisplay(word) {
    let newBlock = document.createElement("div");
    newBlock.className = "wordDisplay wordHistory";
    newBlock.innerHTML = word;

    return newBlock;
}

function submitWord() {
    let word = WORD_INPUT.value.toUpperCase();

    if (word.length < WORD_LENGTH || !VALID_WORDS.has(word)) {
        badSubmit();
        return;
    }

    // check to make sure submission was a valid move
    let lastWord = STARTING_WORD;
    if (HISTORY.length > 0)
        lastWord = HISTORY[HISTORY.length - 1];

    if (lastWord === word) {
        badSubmit();
        return;
    }

    let newDisplay;
    let letterIdx;
    if ( (letterIdx = checkForLetterChange(lastWord, word)) >= 0) {
        newDisplay = constructWordDisplay(word);
        let firstSegment = word.slice(0,letterIdx);
        let secondSegment = "<span class='letterMove'>" + word[letterIdx] + "</span>";
        let thirdSegment = word.slice(letterIdx + 1, word.length);

        newDisplay.innerHTML = firstSegment + secondSegment + thirdSegment;
    } else if (checkForAnagram(lastWord, word)) {
        newDisplay = constructWordDisplay(word);
        newDisplay.classList.add("anagramMove")
    } else {
        badSubmit();
        return;
    }

    HISTORY.push(word);


    let historyContainer = document.getElementById("historyContainer");
    historyContainer.append(newDisplay);

    INPUT_CONTAINER.style.animation = "none";
    WORD_INPUT.value = "";

    setTimeout(() => {
        formatHistory();
        INPUT_CONTAINER.style.animation = "inputReappear 1s";
    });
}

function undo() {
    if (HISTORY.length <= 0) {
        // make an error or smth
        return;
    }

    let lastWord = HISTORY.pop();

    // Create illusion of old input fading away
    let oldInput = document.getElementById("oldInput");
    oldInput.innerHTML = WORD_INPUT.value.toUpperCase();
    oldInput.style.animation = "none";
    oldInput.hidden = false;

    INPUT_CONTAINER.style.animation = "none";
    INPUT_CONTAINER.style.top = WORD_DISPLAY_OFFSET + "px"; // add the class so it moves immediately
    WORD_INPUT.value = lastWord;

    let historyContainer = document.getElementById("historyContainer");
    let historyList = historyContainer.children;
    historyContainer.removeChild(historyList[historyList.length - 1]);

    setTimeout(() => {
        // remove the class and begin the down animation
        INPUT_CONTAINER.style.top = "0";
        INPUT_CONTAINER.style.animation = "inputRealign 0.3s ease-out forwards";

        // fade out old text
        oldInput.style.animation = "inputDisappear 0.3s forwards";

        formatHistory();
    });

    WORD_INPUT.focus();
}

function loadWordList() {
    fetch("https://raw.githubusercontent.com/tabatkins/wordle-list/main/words").then((response) => {
        return response.text();
    }).then((data) => {
       data.toUpperCase().split("\n").forEach((word) => {VALID_WORDS.add(word)});
       console.log(VALID_WORDS);
    });
}

WORD_INPUT.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        submitWord();
    }
});

WORD_INPUT.addEventListener("input", function (event) {
    // sanitize the input to prevent special characters
    this.value = this.value.replace(/[^a-zA-Z]/, "");
});

//
loadWordList();
document.getElementById("startingWord").innerHTML = STARTING_WORD;
formatHistory();
