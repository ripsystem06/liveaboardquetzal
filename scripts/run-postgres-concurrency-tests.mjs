import { execFileSync, spawnSync } from 'node:child_process'

const cwd = process.cwd()
let containerId = ''

function run(command, args, options = {}) {
  return spawnSync(command, args, { cwd, stdio: 'inherit', ...options })
}

try {
  containerId = execFileSync(
    'docker',
    ['run', '--rm', '--detach', '--publish-all', '--env', 'POSTGRES_PASSWORD=postgres', 'postgres:16-alpine'],
    { encoding: 'utf8' },
  ).trim()

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (spawnSync('docker', ['exec', containerId, 'pg_isready', '-U', 'postgres']).status === 0) break
    if (attempt === 29) throw new Error('PostgreSQL container did not become ready')
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const port = execFileSync('docker', ['port', containerId, '5432/tcp'], { encoding: 'utf8' })
    .trim()
    .split(':')
    .at(-1)
  const databaseUrl = `postgresql://postgres:postgres@127.0.0.1:${port}/postgres?schema=public`
  const env = { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl, POSTGRES_CONCURRENCY_TESTS: '1' }

  const push = run('npx', ['prisma', 'db', 'push', '--skip-generate'], { env })
  if (push.status !== 0) process.exitCode = push.status ?? 1
  else {
    const tests = run('npx', ['vitest', 'run', 'app/api/__tests__/postgres-concurrency.test.ts'], { env })
    process.exitCode = tests.status ?? 1
  }
} finally {
  if (containerId) spawnSync('docker', ['rm', '--force', containerId], { stdio: 'inherit' })
}
