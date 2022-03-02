window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);

let countries = [];
let correctIndex;
let correctCountry;
let correctFlag;
let countdown;
let gameOver = false;
let msg;
let choicesAmount = 5;
let roundLength = 20; /* in seconds */
const gameLength = 20; /* in seconds */
let remainingTurns = gameLength;

let score = 0;
let total = 0;
const game = $('.game');
const scoreDiv = $('.score');
const totalDiv = $('.total');
const remaining = $('.remaining');
const startBtn = $('.start-game');


async function getData() {
    try {
        let response = await fetch('https://restcountries.com/v3.1/all');
        return response.json();
    } catch(err) {
        console.log("error: " + err);
    }
}

getData().then(data => {
    countries = data;
    let generated = getNCountries(countries, choicesAmount);
    correctIndex = Math.floor(Math.random() * choicesAmount);
    correctCountry = generated[correctIndex];
    correctFlag = correctCountry.flags.png;
    let html = mapCountries(generated);
    $('.countries').innerHTML = html;
    $('.flag').style.backgroundImage = `url(${correctFlag})`;
    $$('.country').forEach(country => country.addEventListener('click', handleClick));
});

startBtn.addEventListener('click', startGame);

/* generates n random countries from the array of countries */
function getNCountries(arr, n) {
    let countries = [];
    for (let i = 0; countries.length < n; i++) {
        let index = Math.floor(Math.random() * arr.length);
        /* don't get same country twice */
        if (!countries.includes(arr[index])) {
            countries.push(arr[index]);
        }
    }
    return countries;
}

/* maps an array of countries into a string to be inserted as html */
function mapCountries(countries) {
    return countries.map(country => {
        return `<li class="country">
                    ${country.name.common}
                </li>`
    }).join('');
}

function startGame() {
    if (gameOver) gameOver.remove();
    if (msg) msg.textContent = '';
    remaining.textContent = gameLength;
    remainingTurns = gameLength;
    score = 0;
    total = 0;
    scoreDiv.textContent = score;
    totalDiv.textContent = total;
    game.style.display = 'grid';
    newRound();
    $('.start-game').remove();
}

function newRound() {
    clearInterval(countdown);
    startTimer();
    let generated = getNCountries(countries, choicesAmount);
    correctIndex = Math.floor(Math.random() * choicesAmount);
    correctCountry = generated[correctIndex];
    let correctFlag = correctCountry.flags.png;
    let html = mapCountries(generated);
    $('.countries').innerHTML = html;
    $('.flag').style.backgroundImage = `url(${correctFlag})`;
    $$('.country').forEach(country => country.addEventListener('click', handleClick));
}

/* select a country */
function handleClick(e) {
    remainingTurns -= 1;
    total += 1;
    let selected = e.target.innerText;
    let correct = correctCountry.name.common;
    
    if (selected == correct) {
        e.target.classList.add('correct');
        score += 1;
    } else {
        $$('.country').forEach(country => {
            if (country.innerText == correct) {
                country.classList.add('correct')
            }
        });
        e.target.classList.add('incorrect');
    }
    scoreDiv.textContent = score;
    totalDiv.textContent = total;
    remaining.textContent = remainingTurns;
    setTimeout(newRound, 500);
    if (remainingTurns == 0) {
        setTimeout(endGame, 950);
    }
}

function startTimer() {
    let now = Date.now();
    let seconds = roundLength;
    let then = now + roundLength * 1000;
    let display = $('.timer');
    display.textContent = seconds;
    countdown = setInterval(() => {
      let secondsLeft = Math.round((then - Date.now()) / 1000);
      /* if time runs out */
      if (secondsLeft == 0) {
        remainingTurns -= 1;
        total += 1;
        remaining.textContent = remainingTurns;
        totalDiv.textContent = total;
        $$('.country').forEach(country => country.classList.add('incorrect'));
        if (remainingTurns == 0) {
            endGame();
        }
        setTimeout(newRound, 1000);
      }
      display.textContent = secondsLeft % 60
    }, 1000);
}

function endGame() {
    game.style.display = 'none';
    gameOver = document.createElement('div');
    let result = document.createElement('div');
    msg = document.createElement('div');
    result.textContent = `you scored ${score} out of ${gameLength}`;
    msg.textContent = getMessage(score);
    msg.classList.add('center');
    result.classList.add('center');
    gameOver.classList.add('center');
    gameOver.textContent = 'game over';
    startBtn.textContent = 'play again';
    document.body.append(gameOver);
    document.body.append(msg);
    document.body.append(startBtn);
    gameOver.append(result);
}

function getMessage(score) {
    if (score <= gameLength * .25) {
        return 'better luck next time';
    } else if (score > gameLength * .25 && score <= gameLength * .5) {
        return 'trust the process'
    } else if (score > gameLength * .5 && score <= gameLength * .75) {
        return 'you did very well'
    } else if (score > gameLength * .75 && score != gameLength) {
        return "you're something else";
    } else {
        return "you're top 2 and you're not 2"
    }
}