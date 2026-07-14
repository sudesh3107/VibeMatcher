let contentLibrary = [];

const questions = [
  'Do you want something more thrilling, cozy, or mind-bending?',
  'Would you rather watch a new release or a timeless classic?',
  'Are you interested in movie-only recommendations or TV shows too?'
];

const recentComments = [
  '“Blade Runner 2049 felt like the perfect blend of atmosphere and tension.”',
  '“The recommendation engine clearly understood my taste for sci-fi.”',
  '“I love that the app explains why it chose each title.”'
];

const onboardingQuestions = [
  {
    id: 'mood',
    title: 'How are you today?',
    description: 'Pick the feeling that best matches your mood.',
    type: 'choice',
    options: [
      { label: 'Happy', value: 'happy' },
      { label: 'Neutral', value: 'neutral' },
      { label: 'Sad', value: 'sad' }
    ]
  },
  {
    id: 'occasion',
    title: 'What comes closest to your occasion?',
    description: 'Choose the setup that fits your night.',
    type: 'choice',
    options: [
      { label: 'Just watching a movie by myself.', value: 'solo' },
      { label: 'Movie Date.', value: 'date' },
      { label: 'Movie Night with friends.', value: 'friends' },
      { label: 'Date Night with boyfriend or girlfriend.', value: 'partner' },
      { label: 'Watching a movie with family or relatives.', value: 'family' }
    ]
  },
  {
    id: 'genre',
    title: 'Please choose any genre you’re interested in.',
    description: 'Multiple answers are possible.',
    type: 'multi',
    options: [
      { label: 'Action', value: 'Action' },
      { label: 'Comedy', value: 'Comedy' },
      { label: 'Romantic Comedy', value: 'Romantic Comedy' },
      { label: 'I would like to choose from all genres.', value: 'all' }
    ]
  },
  {
    id: 'age',
    title: 'How old would you like the movie to be?',
    description: 'Choose how recent you want the titles to be.',
    type: 'choice',
    options: [
      { label: 'Doesn’t matter.', value: 'any' },
      { label: 'Published in the last 5 years.', value: '5' },
      { label: 'Published in the last 10 years.', value: '10' },
      { label: 'Published in the last 25 years.', value: '25' }
    ]
  },
  {
    id: 'rating',
    title: 'Is the age-appropriateness rating of the movie important to you?',
    description: 'This helps narrow the list by general content maturity.',
    type: 'choice',
    options: [
      { label: 'Yes, I would like to choose the ratings that I’m okay with.', value: 'yes' },
      { label: 'No, it doesn’t matter.', value: 'no' }
    ]
  },
  {
    id: 'category',
    title: 'Please select any other category you’re interested in.',
    description: 'If there are no matches, this question will be ignored.',
    type: 'choice',
    options: [
      { label: 'I don’t have a preference.', value: 'none' },
      { label: 'Movies based on a true story', value: 'movies based on a true story' },
      { label: 'Movies that may change the way you look at life', value: 'movies that may change the way you look at life' },
      { label: 'Movies set in New York City', value: 'movies set in new york city' },
      { label: 'Spy Movies and Cop Movies', value: 'spy movies and cop movies' },
      { label: 'Space Movies', value: 'space movies' },
      { label: 'Wedding Movies', value: 'wedding movies' },
      { label: 'Heist Movies', value: 'heist movies' },
      { label: 'Movies based on a book', value: 'movies based on a book' },
      { label: 'Racing Movies', value: 'racing movies' },
      { label: 'Girl Power Movies', value: 'girl power movies' },
      { label: 'Movies set in Las Vegas', value: 'movies set in las vegas' },
      { label: 'Movies with pre- or sequels', value: 'movies with pre- or sequels' },
      { label: 'IMDb Top 250 Movies', value: 'imdb top 250 movies' }
    ]
  }
];

const onboardingState = {
  step: -1,
  answers: {}
};

function getPopularRecommendations() {
  return [...contentLibrary].sort((a, b) => b.rating - a.rating).slice(0, 4);
}

function hideQuestionPrompt() {
  const prompt = document.getElementById('questionPrompt');
  if (prompt) {
    prompt.classList.add('d-none');
  }
}

function getYearLimit(value) {
  if (!value || value === 'any') return null;
  const currentYear = new Date().getFullYear();
  return currentYear - Number(value);
}

function renderRecommendations() {
  const interestInput = document.getElementById('interestInput').value.toLowerCase();
  const actorInput = document.getElementById('actorInput').value.toLowerCase();
  const recentInput = document.getElementById('recentInput').value.toLowerCase();
  const ratingInput = Number(document.getElementById('ratingInput').value);
  const answers = onboardingState.answers;
  const selectedGenres = (answers.genre || []).filter((value) => value !== 'all');
  const selectedCategory = answers.category && answers.category !== 'none' ? answers.category : null;
  const mood = answers.mood;
  const occasion = answers.occasion;
  const yearLimit = getYearLimit(answers.age);
  const useStrictRatings = answers.rating === 'yes';

  let filtered = contentLibrary.filter((item) => {
    if (yearLimit && item.releaseYear < yearLimit) return false;
    if (useStrictRatings && item.rating < 7.5) return false;

    if (selectedGenres.length && !selectedGenres.some((genre) => item.genres.includes(genre))) {
      return false;
    }

    if (selectedCategory && !item.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())) {
      return false;
    }

    return true;
  });

  const scored = filtered
    .map((item) => {
      let score = 0;
      const genreMatches = item.genres.some((genre) => interestInput.includes(genre.toLowerCase())) ? 1 : 0;
      const actorMatches = item.actors.some((actor) => actorInput.includes(actor.toLowerCase())) ? 1 : 0;
      const recentMatch = recentInput && item.title.toLowerCase().includes(recentInput) ? 1 : 0;
      score += genreMatches * 3 + actorMatches * 2 + recentMatch * 2 + (item.userRating >= ratingInput ? 1 : 0);

      if (selectedGenres.length) {
        score += selectedGenres.filter((genre) => item.genres.includes(genre)).length * 2;
      }

      if (mood === 'happy' && item.genres.includes('Comedy')) score += 2;
      if (mood === 'sad' && item.genres.includes('Drama')) score += 2;
      if (mood === 'neutral' && (item.genres.includes('Thriller') || item.genres.includes('Sci-Fi'))) score += 1;

      if (occasion === 'solo' && (item.genres.includes('Sci-Fi') || item.genres.includes('Thriller'))) score += 2;
      if (occasion === 'friends' && item.genres.includes('Comedy')) score += 2;
      if (occasion === 'family' && item.genres.includes('Drama')) score += 2;
      if (occasion === 'partner' && item.genres.includes('Comedy')) score += 1;

      if (selectedCategory && item.tags.some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase())) score += 2;

      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);

  const results = scored.length ? scored.slice(0, 4) : getPopularRecommendations();

  const recommendationsContainer = document.getElementById('recommendations');
  recommendationsContainer.innerHTML = results.map((item) => `
    <div class="col-md-6">
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <h3 class="h6 fw-bold mb-1">${item.title}</h3>
              <p class="small text-muted mb-2">${item.type === 'show' ? 'TV Show' : 'Movie'} • ${item.releaseYear}</p>
            </div>
            <span class="badge bg-success">★ ${item.rating}</span>
          </div>
          <p class="small mb-2">${item.explanation}</p>
          <div class="small text-muted">Status: ${item.status} • Collection: ${item.collection}</div>
          <div class="small text-muted">Platform: ${item.platform} • Price: ${item.price}</div>
          <div class="mt-2">
            ${item.genres.map((genre) => `<span class="badge bg-light text-dark me-1">${genre}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderQuestions() {
  const questionContainer = document.getElementById('questionList');
  questionContainer.innerHTML = questions.map((question) => `<li class="list-group-item">${question}</li>`).join('');
}

function renderComments() {
  const commentsContainer = document.getElementById('comments');
  commentsContainer.innerHTML = recentComments.map((comment) => `<li class="list-group-item">${comment}</li>`).join('');
}

function renderCatalog() {
  const catalogContainer = document.getElementById('catalog');
  const sortedCatalog = [...contentLibrary].sort((a, b) => b.releaseYear - a.releaseYear);
  catalogContainer.innerHTML = sortedCatalog.map((item) => `
    <div class="col-md-6 col-xl-4">
      <div class="card h-100 border-0 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h3 class="h6 fw-bold">${item.title}</h3>
            <span class="badge bg-info-subtle text-info-emphasis">${item.type === 'show' ? 'TV' : 'Movie'}</span>
          </div>
          <p class="small text-muted mb-2">Released ${item.releaseYear} • ${item.platform}</p>
          <p class="small mb-2">Status: ${item.status}</p>
          <p class="small mb-2">Collection: ${item.collection}</p>
          <p class="small">Pricing: ${item.price}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function renderOnboarding() {
  const body = document.getElementById('onboardingBody');
  const question = onboardingQuestions[onboardingState.step];

  if (onboardingState.step < 0) {
    body.innerHTML = `
      <h2 class="h3 fw-bold mb-3">Let’s personalize your movie night</h2>
      <p class="text-muted mb-4">Answer a few quick questions to get a more tailored recommendation.</p>
      <button id="startOnboarding" type="button" class="btn btn-primary btn-lg align-self-start">Start</button>
      <button id="skipQuestions" type="button" class="btn btn-link text-muted p-0 mt-3 align-self-start">Skip for popular movies</button>
    `;

    document.getElementById('startOnboarding').addEventListener('click', () => {
      onboardingState.step = 0;
      renderOnboarding();
    });
    return;
  }

  if (!question) {
    hideQuestionPrompt();
    renderRecommendations();
    return;
  }

  const optionsMarkup = question.type === 'multi'
    ? question.options.map((option) => `
        <label class="d-flex align-items-center gap-2 border rounded p-3 mb-2">
          <input type="checkbox" name="onboardingOption" value="${option.value}" ${onboardingState.answers[question.id]?.includes(option.value) ? 'checked' : ''} />
          <span>${option.label}</span>
        </label>
      `).join('')
    : question.options.map((option) => `
        <label class="d-flex align-items-center gap-2 border rounded p-3 mb-2 w-100">
          <input type="radio" name="onboardingOption" value="${option.value}" ${onboardingState.answers[question.id] === option.value ? 'checked' : ''} />
          <span>${option.label}</span>
        </label>
      `).join('');

  const isLastQuestion = onboardingState.step === onboardingQuestions.length - 1;

  body.innerHTML = `
    <div class="text-primary small fw-semibold mb-2">Step ${onboardingState.step + 1} of ${onboardingQuestions.length}</div>
    <h2 class="h4 fw-bold mb-2">${question.title}</h2>
    <p class="text-muted mb-4">${question.description}</p>
    <div class="d-flex flex-column gap-2 mb-4">${optionsMarkup}</div>
    <div class="d-flex justify-content-between align-items-center">
      <button id="backOnboarding" type="button" class="btn btn-outline-secondary">Back</button>
      <div class="d-flex gap-2">
        <button id="skipQuestions" type="button" class="btn btn-link text-muted p-0">Skip</button>
        <button id="nextOnboarding" type="button" class="btn btn-primary">${isLastQuestion ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  `;

  document.getElementById('backOnboarding').addEventListener('click', () => {
    onboardingState.step = Math.max(0, onboardingState.step - 1);
    renderOnboarding();
  });

  document.getElementById('nextOnboarding').addEventListener('click', () => {
    const selectedValues = Array.from(body.querySelectorAll('input[name="onboardingOption"]:checked')).map((input) => input.value);
    if (question.type === 'multi') {
      onboardingState.answers[question.id] = selectedValues;
    } else if (selectedValues.length) {
      onboardingState.answers[question.id] = selectedValues[0];
    }

    if (onboardingState.step === onboardingQuestions.length - 1) {
      hideQuestionPrompt();
      renderRecommendations();
      return;
    }

    onboardingState.step += 1;
    renderOnboarding();
  });

  document.getElementById('skipQuestions').addEventListener('click', () => {
    onboardingState.answers = {};
    onboardingState.step = -1;
    hideQuestionPrompt();
    renderRecommendations();
  });
}

async function loadContent() {
  try {
    const response = await fetch('/api/movies');
    if (!response.ok) throw new Error('Failed to load movie data');
    contentLibrary = await response.json();
    renderCatalog();
    renderRecommendations();
  } catch (error) {
    console.error(error);
    document.getElementById('recommendations').innerHTML = '<div class="col-12 text-danger">Unable to load movie data from the database source.</div>';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  renderQuestions();
  renderComments();
  renderOnboarding();
  await loadContent();

  document.querySelectorAll('#interestInput, #actorInput, #recentInput, #ratingInput').forEach((input) => {
    input.addEventListener('input', renderRecommendations);
  });
});
