const socket = io();

const questions = [
    {
        question: "Would you rather have unlimited bacon or unlimited donuts?",
        blueOption: { image: "assets/cars/1.jpg", text: "Bugatti" }, redOption: { image: "assets/cars/2.jpg", text: "Lamborghini" } },
    {
        question: "Would you rather play Fortnite or PUBG?",
        blueOption: { image: "assets/games/1.jpg", text: "Fortnite" }, redOption: { image: "assets/games/2.jpg", text: "PUBG" } },
    {
        question: "Would you rather eat pizza or burgers for the rest of your life?",
        blueOption: { image: "assets/food/1.jpg", text: "Pizza" }, redOption: { image: "assets/food/2.jpg", text: "Burgers" } },
    {
        question: "Would you rather work for Google or Apple?",
        blueOption: { image: "assets/companies/1.jpg", text: "Google" }, redOption: { image: "assets/companies/2.jpg", text: "Apple" } },
    {
        question: "Would you rather be Superman or Batman?",
        blueOption: { image: "assets/superheroes/1.jpg", text: "Superman" }, redOption: { image: "assets/superheroes/2.jpg", text: "Batman" } },
    {
        question: "Would you rather have a Ferrari or a McLaren?",
        blueOption: { image: "assets/cars/5.jpg", text: "Ferrari" }, redOption: { image: "assets/cars/6.jpg", text: "McLaren" } },
    {
        question: "Would you rather enjoy Minecraft or Terraria?",
        blueOption: { image: "assets/games/5.jpg", text: "Minecraft" }, redOption: { image: "assets/games/6.jpg", text: "Terraria" } },
    {
        question: "Would you rather eat sushi or tacos for every meal?",
        blueOption: { image: "assets/food/5.jpg", text: "Sushi" }, redOption: { image: "assets/food/6.jpg", text: "Tacos" } },
    {
        question: "Would you rather work at Tesla or SpaceX?",
        blueOption: { image: "assets/companies/3.jpg", text: "Tesla" }, redOption: { image: "assets/companies/4.jpg", text: "SpaceX" } },
    {
        question: "Would you rather have the powers of Spider-Man or Iron Man?",
        blueOption: { image: "assets/superheroes/3.jpg", text: "Spider-Man" }, redOption: { image: "assets/superheroes/4.jpg", text: "Iron Man" } },
    {
        question: "Would you rather experience a Mercedes-Benz or a BMW?",
        blueOption: { image: "assets/cars/17.jpg", text: "Mercedes-Benz" }, redOption: { image: "assets/cars/18.jpg", text: "BMW" } },
    {
        question: "Would you rather enjoy Grand Theft Auto or Red Dead Redemption?",
        blueOption: { image: "assets/games/19.jpg", text: "Grand Theft Auto" }, redOption: { image: "assets/games/20.jpg", text: "Red Dead Redemption" } },
    {
        question: "Would you rather have pancakes or waffles for breakfast?",
        blueOption: { image: "assets/food/11.jpg", text: "Pancakes" }, redOption: { image: "assets/food/12.jpg", text: "Waffles" } },
    {
        question: "Would you rather work at Microsoft or Amazon?",
        blueOption: { image: "assets/companies/5.jpg", text: "Microsoft" }, redOption: { image: "assets/companies/6.jpg", text: "Amazon" } },
    {
        question: "Would you rather be Thor or Hulk?",
        blueOption: { image: "assets/superheroes/7.jpg", text: "Thor" }, redOption: { image: "assets/superheroes/8.jpg", text: "Hulk" } },
    {
        question: "Would you rather own a Koenigsegg or a Pagani ?",
        blueOption: { image: "assets/cars/19.jpg", text: "Koenigsegg " }, redOption: { image: "assets/cars/20.jpg", text: "Pagani " } },
    {
        question: "Would you rather explore in The Legend of Zelda or Elden Ring?",
        blueOption: { image: "assets/games/9.jpg", text: "The Legend of Zelda" }, redOption: { image: "assets/games/10.jpg", text: "Elden Ring" } },
    {
        question: "Would you rather eat Chinese takeout or Italian pasta?",
        blueOption: { image: "assets/food/17.jpg", text: "Chinese Takeout" }, redOption: { image: "assets/food/18.jpg", text: "Italian Pasta" } },
    {
        question: "Would you rather work for Netflix or Disney?",
        blueOption: { image: "assets/companies/7.jpg", text: "Netflix" }, redOption: { image: "assets/companies/8.jpg", text: "Disney" } },
    {
        question: "Would you rather join the Avengers or the Justice League?",
        blueOption: { image: "assets/superheroes/9.jpg", text: "Avengers" }, redOption: { image: "assets/superheroes/10.jpg", text: "Justice League" } }
];

const videoElement = document.getElementById('webcam');

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();

function onResults(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    handleChoice('NEUTRAL');
    return;
  }

  const wristX = results.multiHandLandmarks[0][0].x;

  if (wristX < 0.35) {
    handleChoice('LEFT');
  } else if (wristX > 0.65) {
    handleChoice('RIGHT');
  } else {
    handleChoice('NEUTRAL');
  }
}

let currentQuestionIndex = 0;
let choiceMadeThisRound = false;

const questionText = document.getElementById('question-text');
const optionLeftText = document.getElementById('option-left-text');
const optionRightText = document.getElementById('option-right-text');
const imageLeft = document.getElementById('image-left');
const imageRight = document.getElementById('image-right');
const feedbackText = document.getElementById('feedback-text');
const restartButton = document.getElementById('restart-button');
const blueOptionCard = document.getElementById('blue-option');
const redOptionCard = document.getElementById('red-option');
const splitScreenContainer = document.querySelector('.split-screen-container');
const divider = document.querySelector('.divider');
const video = document.getElementById('webcam');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showResult();
    return;
  }

  const question = questions[currentQuestionIndex];
  questionText.textContent = question.question;
  optionLeftText.textContent = question.blueOption.text;
  imageLeft.src = question.blueOption.image;
  optionRightText.textContent = question.redOption.text;
  imageRight.src = question.redOption.image;

  blueOptionCard.classList.remove('selected');
  redOptionCard.classList.remove('selected');
  feedbackText.textContent = "Show your palm to make a choice...";
  choiceMadeThisRound = false;
}

function handleChoice(choice) {
  if (choiceMadeThisRound || choice === 'NEUTRAL') return;

  choiceMadeThisRound = true;

  if (choice === 'LEFT') {
    blueOptionCard.classList.add('selected');
    feedbackText.textContent = `You chose ${questions[currentQuestionIndex].blueOption.text}!`;
  } else if (choice === 'RIGHT') {
    redOptionCard.classList.add('selected');
    feedbackText.textContent = `You chose ${questions[currentQuestionIndex].redOption.text}!`;
  }

  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 1800);
}

function showResult() {
  splitScreenContainer.style.display = 'none';
  divider.style.display = 'none';
  questionText.textContent = "Game Over!";
  feedbackText.textContent = "Thanks for playing!";
  restartButton.style.display = 'block';
}

function startGame() {
  shuffleArray(questions);
  currentQuestionIndex = 0;
  restartButton.style.display = 'none';
  splitScreenContainer.style.display = 'flex';
  divider.style.display = 'flex';
  loadQuestion();
}

async function setupWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      setInterval(() => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL('image/jpeg', 0.5);
        socket.emit('video_frame', data);
      }, 200);
    });
  } catch (err) {
    console.error("Error accessing webcam: ", err);
    feedbackText.textContent = "Webcam access is required to play!";
  }
}

socket.on('hand_update', function(data) {
  handleChoice(data.choice);
});

socket.on('connect', function() {
  console.log('Connected to server!');
});

restartButton.addEventListener('click', startGame);
startGame();
setupWebcam();
