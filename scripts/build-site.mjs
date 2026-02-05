import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const isTruthy = (value) => {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

const run = (command, env) => {
  execSync(command, {
    stdio: 'inherit',
    env,
  });
};

const env = {
  ...process.env,
  NODE_ENV: 'production',
};

const articleOnlyBuild =
  isTruthy(env.BUILD_ONLY_ARTICLE_PAGES) || isTruthy(env.BUILD_ONLY_ARTICLES);

try {
  if (articleOnlyBuild) {
    console.log('BUILD_ONLY_ARTICLE_PAGES enabled: skipping search index generation.');
  } else {
    run('npm run generate-search-index', env);
  }

  run('npx astro build', env);

  if (articleOnlyBuild) {
    // Keep homepage + article routes, remove category/tag static outputs before deploy sync.
    rmSync('dist/categories', { recursive: true, force: true });
    rmSync('dist/tags', { recursive: true, force: true });
    console.log('Removed dist/categories and dist/tags for article-only deploy.');
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
