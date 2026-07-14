import { contentLibrary } from '../data/content';

export const sortByReleaseDate = (items) =>
  [...items].sort((a, b) => b.releaseYear - a.releaseYear);

export const getRecommendations = ({ interests = [], favoriteActors = [], recentWatched = [], ratingBias = 3 }) => {
  const interestSet = new Set(interests.map((item) => item.toLowerCase()));
  const actorSet = new Set(favoriteActors.map((item) => item.toLowerCase()));
  const recentSet = new Set(recentWatched.map((item) => item.toLowerCase()));

  const scored = contentLibrary
    .filter((item) => item.type === 'movie' || item.type === 'show')
    .map((item) => {
      const title = item.title.toLowerCase();
      const genreMatches = item.genres.filter((genre) => interestSet.has(genre.toLowerCase())).length;
      const actorMatches = item.actors.filter((actor) => actorSet.has(actor.toLowerCase())).length;
      const recentMatches = recentWatched.some((recent) => title.includes(recent.toLowerCase())) ? 1 : 0;
      const score = genreMatches * 3 + actorMatches * 2 + recentMatches * 2 + item.rating * 0.5 + (item.userRating >= ratingBias ? 1 : 0);

      return { ...item, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 6);
};
