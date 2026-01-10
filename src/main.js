import {loadWordList, assertValidWord, resetGame } from "./game-logic.js";
import { checkForLetterChange, checkForAnagram } from "./game-logic.js";
import { HISTORY, STARTING_WORD, TARGET_WORD } from "./game-logic.js";

const WORD_INPUT = document.getElementById("wordInput");
const INPUT_CONTAINER = document.getElementById("inputContainer");
const UNDO_BUTTON = document.getElementById("undo-button");

const WORD_DISPLAY_OFFSET = -100; // in px

/* Animation Functions */

function beginGameAnimation() {
    let buttonContainer = document.getElementById("buttonContainer");
    buttonContainer.hidden = true;
    let targetContainer = document.getElementById("targetContainer");
    targetContainer.style.opacity = "0";

    let gameContainer = document.getElementById("gameContainer");
    gameContainer.hidden = false;
    gameContainer.style.animation = "reveal 3s ease-in-out";

    setTimeout(() => {
        targetContainer.hidden = false;
        targetContainer.style.animation = "reveal 3s ease-in-out forwards";

        setTimeout( () => {
            revealInputAnimation();
            buttonContainer.hidden = false;
            buttonContainer.style.animation = "reveal 2s ease-in-out";

            WORD_INPUT.focus();
        }, 3000);

    }, 3000);
}

function victoryAnimation() {
    let gameContainer = document.getElementById("gameContainer");
    gameContainer.style.animation = "hide 1.5s ease-in-out forwards";

    let victoryDisplay = document.getElementById("victoryDisplay");
    victoryDisplay.innerHTML = TARGET_WORD;
    victoryDisplay.style.animation = "victory 3s ease-in-out forwards";
    victoryDisplay.hidden = false;

    let victoryText = document.getElementById("victoryText");
    victoryText.hidden = true;
    let moveCounter = document.getElementById("moveCounter");
    moveCounter.innerHTML = (HISTORY.length + 1).toString();

    setTimeout( () => {
        victoryText.hidden = false;
        victoryText.style.animation = "reveal 2s ease-in-out forwards";
    }, 1500)

    setTimeout(() => {
        let victoryVideo = document.getElementById("victoryVideo");
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

function constructWordDisplay(word) {
    let newBlock = document.createElement("div");
    newBlock.className = "wordDisplay smoothMovement";
    newBlock.innerHTML = word;
    newBlock.style.top = "0";

    return newBlock;
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
        victoryAnimation();
    } else {
        // Add the move to the history
        HISTORY.push(word);
        let newDisplay = constructWordDisplay(word);
        if (letterIdx >= 0) {
            let firstSegment = word.slice(0, letterIdx);
            let secondSegment = "<span class='letterMove'>" + word[letterIdx] + "</span>";
            let thirdSegment = word.slice(letterIdx + 1, word.length);

            newDisplay.innerHTML = firstSegment + secondSegment + thirdSegment;
        } else {
            newDisplay.classList.add("anagramMove");
        }


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
})



//
loadWordList();

function startGame(startWord, targetWord) {
    resetGame(startWord, targetWord);

    let historyContainer = document.getElementById("historyContainer");
    historyContainer.replaceChildren();

    let startingWordContainer = document.createElement("div");
    startingWordContainer.id = "startingWord";
    startingWordContainer.className = "wordDisplay smoothMovement startingWord";
    startingWordContainer.innerHTML = STARTING_WORD;
    startingWordContainer.style.top = "0";
    historyContainer.append(startingWordContainer);

    let targetWordContainer = document.getElementById("targetWord");
    targetWordContainer.innerHTML = TARGET_WORD;

    beginGameAnimation();
}

startGame("QUITS", "QUILT");
