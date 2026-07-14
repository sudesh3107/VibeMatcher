import { describe, expect, it } from 'vitest';
import { contentLibrary } from '../data/content';
import { getRecommendations, sortByReleaseDate } from './recommendations';

describe('recommendation helpers', () => {
  it('returns titles that match user interests and recent choices', () => {
    const recommendations = getRecommendations({
      interests: ['Sci-Fi', 'Thriller'],
      favoriteActors: ['Zendaya', 'Timothée Chalamet'],
      recentWatched: ['Dune: Part Two'],
      ratingBias: 4,
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].title).toBe('Blade Runner 2049');
  });

  it('sorts content by release date descending', () => {
    const sorted = sortByReleaseDate(contentLibrary);
    expect(sorted[0].releaseYear).toBeGreaterThanOrEqual(sorted[1].releaseYear);
  });
});
