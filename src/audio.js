//const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

let AUDIO_BUFFER_MAP = new Map();

export function loadAudioFile(src, soundName) {
    return fetch(src).then(res => res.arrayBuffer())
            .then(bufferData => audioCtx.decodeAudioData(bufferData))
        .then(buffer => AUDIO_BUFFER_MAP.set(soundName, buffer));
}

export function playSound(soundName) {
    if (!AUDIO_BUFFER_MAP.has(soundName)) {
        throw new Error(`Sound '${soundName}' not found`);
    }

    const source = audioCtx.createBufferSource();
    source.buffer = AUDIO_BUFFER_MAP.get(soundName);
    source.connect(audioCtx.destination);
    source.start();
}