// ===== Get DOM elements =====
let testSelection = document.getElementById("testSelection");
let testsContainer = document.getElementById("testsContainer");
let quizContainer = document.getElementById("quizContainer");
let backButton = document.getElementById("backButton");
let quizCategory = document.getElementById("quizCategory");
let questionCount = document.getElementById("questionCount");
let quizArea = document.getElementById("quizArea");
let answersArea = document.getElementById("answersArea");
let submitButton = document.getElementById("submitButton");
let bulletsSpans = document.getElementById("bulletsSpans");
let countdownElement = document.getElementById("countdown");
let resultsElement = document.getElementById("results");

// ===== Quiz variables =====
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let countdown;
let timeLeft = 60;

// ===== List of available quizzes =====
const availableQuizzes = [
  { id: "html", path: "quizzes/html.json" },
  { id: "css", path: "quizzes/css.json" },
  { id: "javascript", path: "quizzes/js.json" },
];

// ===== Handle Back button to go back to selection =====
backButton.addEventListener("click", () => {
  resetQuiz();
  testSelection.style.display = "block";
  quizContainer.style.display = "none";
});

// ===== Load all quizzes from JSON files =====
async function loadQuizzes() {
  for (let quiz of availableQuizzes) {
    try {
      let data = await fetch(quiz.path);
      let response = await data.json();
      loadQuizesCategory(response);
    } catch (error) {
      alert(`Error loading quiz ${quiz.id}:`, error);
    }
  }
}

// ===== Create and display each quiz category card =====
function loadQuizesCategory(res) {
  let quizCard = document.createElement("div");
  quizCard.classList.add("test-card");
  let quizCardId = res.title;
  quizCard.id = quizCardId;

  let h2 = document.createElement("h2");
  h2.textContent = res.title;

  let paragraph = document.createElement("p");
  paragraph.textContent = res.description;

  let qdiv = document.createElement("div");
  qdiv.classList.add("questions-count");
  qdiv.textContent = res.questions.length + " questions";

  quizCard.appendChild(h2);
  quizCard.appendChild(paragraph);
  quizCard.appendChild(qdiv);

  // On click, start the quiz
  quizCard.addEventListener("click", () => startQuiz(quizCardId, res));

  testsContainer.appendChild(quizCard);
}

// ===== Start the selected quiz =====
async function startQuiz(quizId, res) {
  if (!res) {
    let filterQuizes = availableQuizzes.filter((q) => q.id === quizId);
    let data = await fetch(filterQuizes[0].path);
    currentQuiz = await data.json();
  } else {
    currentQuiz = res;
  }

  // Reset quiz state
  currentQuestionIndex = 0;
  score = 0;

  // Switch to quiz view
  testSelection.style.display = "none";
  quizContainer.style.display = "block";
  quizCategory.textContent = res.title;

  // Generate bullets for progress tracking
  bulletsSpans.innerHTML = "";
  for (let i = 0; i < currentQuiz.questions.length; i++) {
    const bullet = document.createElement("span");
    if (i === 0) bullet.className = "on";
    bulletsSpans.appendChild(bullet);
  }

  showQuestion(currentQuiz);
  showAnswers(currentQuiz);
  startCountdown();
}

// ===== Display current question =====
function showQuestion(quizData) {
  questionCount.textContent = `${currentQuestionIndex + 1} / ${
    quizData.questions.length
  }`;

  let currentQuestion = document.querySelector("#quizArea h2");
  if (currentQuestion) currentQuestion.remove();

  let questionTitle = document.createElement("h2");
  questionTitle.textContent = quizData.questions[currentQuestionIndex].question;
  quizArea.appendChild(questionTitle);
}

// ===== Display answer choices =====
function showAnswers(quizData) {
  let answers = document.querySelectorAll(".answer");
  answers.forEach((answer) => answer.remove());

  quizData.questions[currentQuestionIndex].answers.forEach((answer) => {
    const answerDiv = document.createElement("div");
    answerDiv.className = "answer";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "answer";
    radio.id = answer;
    radio.value = answer;

    const label = document.createElement("label");
    label.htmlFor = answer;
    label.textContent = answer;

    answerDiv.appendChild(radio);
    answerDiv.appendChild(label);
    answersArea.appendChild(answerDiv);
  });

  // Update bullet highlights
  const bullets = document.querySelectorAll(".spans span");
  bullets.forEach((bullet, index) => {
    bullet.className = index === currentQuestionIndex ? "on" : "";
  });
}

// ===== Check selected answer and update score =====
function checkAnswer() {
  let selectedAnswer = document.querySelector("input[name='answer']:checked");
  if (!selectedAnswer) {
    alert("Please select an answer!");
    return;
  }

  let correctAnswer = currentQuiz.questions[currentQuestionIndex].correct;
  let myAnswer = selectedAnswer.value;

  if (myAnswer === correctAnswer) {
    score++;
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < currentQuiz.questions.length) {
    showQuestion(currentQuiz);
    showAnswers(currentQuiz);
  } else {
    showResults();
  }
}

// ===== Display final quiz results =====
function showResults() {
  clearInterval(countdown);

  let results = "";
  let totalQuestions = currentQuiz.questions.length;
  let percentage = (score / totalQuestions) * 100;

  if (percentage < 50) {
    results = `<span class="bad">You need to improve! (${score}/${totalQuestions})</span>`;
  } else if (percentage >= 50 && percentage < 80) {
    results = `<span class="good">Good job!! (${score}/${totalQuestions})</span>`;
  } else {
    results = `<span class="perfect">Excellent! (${score}/${totalQuestions})</span>`;
  }

  // Clear and show results
  quizArea.innerHTML = "";
  answersArea.innerHTML = "";
  submitButton.style.display = "none";
  bulletsSpans.innerHTML = "";
  countdownElement.innerHTML = "";
  document.getElementById("quiz-info").style.border = "none";
  document.getElementById("bullets").style.border = "none";

  resultsElement.innerHTML = `
    <h3>Quiz Completed!</h3>
    <p>${results}</p>
    <button onclick="restartQuiz()" class="submit-button" style="margin-top: 20px;">Try Again</button>
  `;
}

// ===== Restart the current quiz =====
function restartQuiz() {
  resultsElement.innerHTML = "";
  submitButton.style.display = "block";
  currentQuestionIndex = 0;
  score = 0;
  showQuestion(currentQuiz);
  showAnswers(currentQuiz);
  startCountdown();
}

// ===== Submit button triggers answer check =====
submitButton.addEventListener("click", () => checkAnswer());

// ===== Reset the quiz (on back button) =====
function resetQuiz() {
  clearInterval(countdown);
  currentQuestionIndex = 0;
  score = 0;
  timeLeft = 60;
  quizArea.innerHTML = "";
  answersArea.innerHTML = "";
  resultsElement.innerHTML = "";
  submitButton.style.display = "block";
}

// ===== Start or restart countdown timer =====
function startCountdown() {
  clearInterval(countdown);
  timeLeft = 60;
  countdownElement.textContent = `Time: ${timeLeft}s`;

  countdown = setInterval(() => {
    timeLeft--;
    countdownElement.textContent = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(countdown);
      showResults(); // Auto-submit on timeout
    }
  }, 1000);
}

// ===== Load quizzes on page load =====
loadQuizzes();
