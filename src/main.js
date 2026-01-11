import {loadWordList, assertValidWord, resetGame } from "./game-logic.js";
import { checkForLetterChange, checkForAnagram } from "./game-logic.js";
import { HISTORY, STARTING_WORD, TARGET_WORD } from "./game-logic.js";

import PUZZLES from "./puzzles.json" with { type: "json" }

const WORD_INPUT = document.getElementById("wordInput");
const INPUT_CONTAINER = document.getElementById("inputContainer");
const UNDO_BUTTON = document.getElementById("undo-button");
const RESET_BUTTON = document.getElementById("resetButton");
const HELP_BUTTON = document.getElementById("help-button");
const CLOSE_HELP_BUTTON = document.getElementById("closeHelp");

let MOBILE_MODE = false;
let WORD_DISPLAY_OFFSET = -100; // in px

/* Animation Functions */

function beginGameAnimation() {
    let buttonContainer = document.getElementById("buttonContainer");
    buttonContainer.hidden = true;
    buttonContainer.style.animation = "none";
    let targetContainer = document.getElementById("targetContainer");
    targetContainer.style.opacity = "0";
    targetContainer.style.animation = "none";

    let gameContainer = document.getElementById("gameContainer");
    gameContainer.hidden = false;
    gameContainer.style.animation = "reveal 3s ease-in-out";

    let keyboardContainer = document.getElementById("keyboardContainer");
    keyboardContainer.hidden = true;
    keyboardContainer.style.animation = "none";

    setTimeout(() => {
        targetContainer.hidden = false;
        targetContainer.style.animation = "reveal 3s ease-in-out forwards";

        setTimeout( () => {
            revealInputAnimation();
            buttonContainer.hidden = false;
            buttonContainer.style.animation = "reveal 2s ease-in-out";

            let keyboardContainer = document.getElementById("keyboardContainer");
            keyboardContainer.hidden = false;
            keyboardContainer.style.animation = "reveal 2s ease-in-out";

            WORD_INPUT.focus();
        }, 3000);

    }, 3000);
}

function resumeGameAnimation() {
    let buttonContainer = document.getElementById("buttonContainer");
    buttonContainer.hidden = false;
    buttonContainer.style.animation = "none";

    let targetContainer = document.getElementById("targetContainer");
    targetContainer.style.opacity = "1";
    targetContainer.style.animation = "none";

    let gameContainer = document.getElementById("gameContainer");
    gameContainer.hidden = false;
    gameContainer.style.animation = "reveal 3s ease-in-out";

    let keyboardContainer = document.getElementById("keyboardContainer");
    keyboardContainer.hidden = false;
    keyboardContainer.style.animation = "reveal 3s ease-in-out";

    setTimeout(() => {
        WORD_INPUT.focus();
    }, 3000);
}

function victoryAnimation() {
    let gameContainer = document.getElementById("gameContainer");
    gameContainer.style.animation = "hide 1.5s ease-in-out forwards";

    let keyboardContainer = document.getElementById("keyboardContainer");
    keyboardContainer.style.animation = "hide 1.5s ease-in-out forwards";

    let victoryContainer = document.getElementById("victoryContainer");
    victoryContainer.hidden = false;

    let victoryDisplay = document.getElementById("victoryDisplay");
    victoryDisplay.innerHTML = TARGET_WORD;
    victoryDisplay.style.animation = "victory 3s ease-in-out forwards";
    victoryDisplay.hidden = false;

    let victoryText = document.getElementById("victoryText");
    victoryText.hidden = true;

    let moveCounter = document.getElementById("moveCounter");
    moveCounter.innerHTML = (HISTORY.length + 1).toString();

    let victoryVideo = document.getElementById("victoryVideo");
    victoryVideo.hidden = true;

    setTimeout( () => {
        victoryText.hidden = false;
        victoryText.style.animation = "reveal 2s ease-in-out forwards";
    }, 1500)

    setTimeout(() => {
        victoryVideo.hidden = false;
        victoryVideo.play();
    }, 4000);
}

function badSubmit() {
    INPUT_CONTAINER.style.animation = "none";
    setTimeout(() => {
        INPUT_CONTAINER.style.animationComposition = "accumulate";
        INPUT_CONTAINER.style.animation = "NoSubmit 0.5s";
    });
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

function revealInputAnimation() {
    INPUT_CONTAINER.style.animation = "none";
    WORD_INPUT.value = "";

    setTimeout(() => {
        formatHistory();
        INPUT_CONTAINER.style.animation = "reveal 1s";
    });
}

function revealHelpText() {
    let cover = document.getElementById("cover");
    let helpText = document.getElementById("helpText");
    cover.hidden = false;
    helpText.hidden = false;

    cover.style.animation = "reveal 1s forwards";
    helpText.style.animation = "reveal 1s forwards";
}

function hideHelpText() {
    let cover = document.getElementById("cover");
    let helpText = document.getElementById("helpText");

    cover.style.animation = "hide 1s forwards";
    helpText.style.animation = "hide 1s forwards";
}

function constructWordDisplay(word) {
    let newBlock = document.createElement("div");
    newBlock.className = "wordDisplay text-lg smoothMovement";
    newBlock.innerHTML = word;
    newBlock.style.top = "0";

    return newBlock;
}

function constructWordHistory(word, lastWord) {
    let newDisplay = constructWordDisplay(word);

    const letterIdx = checkForLetterChange(lastWord, word);

    if (letterIdx >= 0) {
        let firstSegment = word.slice(0, letterIdx);
        let secondSegment = "<span class='letterMove'>" + word[letterIdx] + "</span>";
        let thirdSegment = word.slice(letterIdx + 1, word.length);

        newDisplay.innerHTML = firstSegment + secondSegment + thirdSegment;
    } else {
        newDisplay.classList.add("anagramMove");
    }

    return newDisplay;
}


/*
*  Control functions
*/

function submitWord() {
    let word = WORD_INPUT.value.toUpperCase();

    if (!assertValidWord(word)) {
        badSubmit();
        return;
    }

    let lastWord = STARTING_WORD;
    if (HISTORY.length > 0)
        lastWord = HISTORY[HISTORY.length - 1];

    if (lastWord === word) {
        badSubmit();
        return;
    }

    // Check for a valid move
    let letterIdx = checkForLetterChange(lastWord, word);
    if (letterIdx < 0 && !checkForAnagram(lastWord, word)) {
        badSubmit();
        return;
    }

    // Move was valid.
    // Did we win?

    if (word === TARGET_WORD) {
        // We did win!
        endGame();

    } else {
        // Add the move to the history
        HISTORY.push(word);

        sessionStorage.setItem("history", HISTORY.toString());

        // Update visuals
        let newDisplay = constructWordHistory(word, lastWord);

        let historyContainer = document.getElementById("historyContainer");
        historyContainer.append(newDisplay);

        setTimeout(() => {
            newDisplay.classList.add("wordHistory")
        });
        revealInputAnimation();
    }
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
        oldInput.style.animation = "hide 0.3s forwards";

        formatHistory();
    });

    WORD_INPUT.focus();
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

UNDO_BUTTON.addEventListener("click", function (event) {
    undo();
});

RESET_BUTTON.addEventListener("click", function (event) {
    startGame(STARTING_WORD, TARGET_WORD);
});

HELP_BUTTON.addEventListener("click", function (event) {
    revealHelpText();
});

CLOSE_HELP_BUTTON.addEventListener("click", function (event) {
    hideHelpText();
});


function onKeyboardPress(key) {
    if (key === "ENTER") {
        submitWord();
        return;
    }

    if (key === "BACK") {
        WORD_INPUT.value = WORD_INPUT.value.slice(0, WORD_INPUT.value.length - 1);
        return;
    }

    // Letter key
    if (WORD_INPUT.value.length < STARTING_WORD.length) {
        WORD_INPUT.value = WORD_INPUT.value + key;
        return;
    }
}

function setMobileMode(on) {
    if (on) {
        MOBILE_MODE = true;
        WORD_DISPLAY_OFFSET = -80;
        WORD_INPUT.disabled = true;
    } else {
        MOBILE_MODE = false;
        WORD_DISPLAY_OFFSET = -100;
        WORD_INPUT.disabled = false;
    }

    formatHistory();
}

let keyboardButtons = document.querySelectorAll("#keyboardContainer button");
keyboardButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {
        onKeyboardPress(this.value);
    });

    // remove the focus after click is finished
    button.addEventListener("touchend", function (event) {
        button.blur();
    })
});



function correctScreenSize() {
    if (window.innerWidth <= 512 && !MOBILE_MODE) {
        setMobileMode(true);
    } else if (MOBILE_MODE) {
        setMobileMode(false);
    }
}

addEventListener("resize", function (event) {
    correctScreenSize();
});



//

function startGame(startWord, targetWord, history=[]) {
    resetGame(startWord, targetWord, history);

    // Storage for persistent levels
    sessionStorage.setItem("startWord", startWord);
    sessionStorage.setItem("targetWord", targetWord);
    sessionStorage.setItem("history", history.toString());

    let victoryContainer = document.getElementById("victoryContainer");
    victoryContainer.hidden = true;

    // clear history display
    let historyContainer = document.getElementById("historyContainer");
    historyContainer.replaceChildren();

    let startingWordContainer = constructWordDisplay(STARTING_WORD);
    startingWordContainer.id = "startingWord";
    startingWordContainer.classList.add("startingWord");
    historyContainer.append(startingWordContainer);

    let targetWordContainer = document.getElementById("targetWord");
    targetWordContainer.innerHTML = TARGET_WORD;

    if (history.length > 0) {
        // Resume game

        let lastWord = STARTING_WORD;
        for (const word of HISTORY) {
            let newDisplay = constructWordHistory(word, lastWord);
            newDisplay.classList.add("wordHistory");

            historyContainer.append(newDisplay);
            lastWord = word;
        }

        formatHistory();
        resumeGameAnimation();
    } else {
        beginGameAnimation();
    }

}

function endGame() {
    // clear session storage
    sessionStorage.removeItem("startWord");
    sessionStorage.removeItem("targetWord");
    sessionStorage.removeItem("history");

    victoryAnimation();
}

async function onload() {
    await loadWordList();

    correctScreenSize();

    // Check for session storage
    let startWord = sessionStorage.getItem("startWord");
    let targetWord = sessionStorage.getItem("targetWord");
    if (startWord !== null && targetWord !== null) {
        // There is session storage!
        // Load previous game history and resume
        let oldHistory = sessionStorage.getItem("history").split(",");
        if (oldHistory[0] === "")
            oldHistory = [];

        startGame(startWord, targetWord, oldHistory);
    } else {
        // Start a new game

        let puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];

        startWord = puzzle["start"];
        targetWord = puzzle["target"];

        // read words from query string if it exists
        const urlParams = new URLSearchParams(window.location.search);
        const queryStartWord = urlParams.get("startWord");
        const queryTargetWord = urlParams.get("targetWord");

        if (queryStartWord !== null && assertValidWord(queryStartWord))
            startWord = queryStartWord;
        if (queryTargetWord !== null && assertValidWord(queryTargetWord))
            targetWord = queryTargetWord;

        startGame(startWord, targetWord);
    }
}

await onload();
