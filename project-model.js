export function isActive(repo, days, now = Date.now()) {
  const pushed = Date.parse(repo.pushedAt);
  return !repo.archived && Number.isFinite(pushed) && pushed >= now - days * 86400000;
}

export function selectProjects(repos, { scope = 'active', category = 'all', query = '', days = 90, now = Date.now() } = {}) {
  const search = query.trim().toLowerCase();
  return repos.filter(repo =>
    (scope !== 'active' || (!repo.archived && (isActive(repo, days, now) || repo.featured))) &&
    (scope !== 'archive' || !isActive(repo, days, now)) &&
    (category === 'all' || repo.category === category) &&
    `${repo.name} ${repo.description} ${repo.language} ${repo.category}`.toLowerCase().includes(search)
  ).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Date.parse(b.pushedAt) - Date.parse(a.pushedAt));
}

export function normalizeRepositories(repos, settings) {
  return repos.filter(repo => !repo.private && !settings.excluded.includes(repo.name)).map(repo => {
    const custom = settings.overrides[repo.name] || {};
    return {
      name: repo.name,
      description: custom.description || repo.description || 'No description provided.',
      url: repo.html_url,
      homepage: repo.homepage || null,
      language: repo.language || 'Mixed',
      category: custom.category || 'other',
      fork: repo.fork,
      archived: repo.archived,
      featured: custom.featured === true,
      pushedAt: repo.pushed_at || repo.created_at,
      stars: repo.stargazers_count
    };
  });
}
