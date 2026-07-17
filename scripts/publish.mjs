import { execSync } from 'node:child_process'

const msg = process.argv[2] || 'update: blog content'

try {
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m "${msg}"`, { stdio: 'inherit' })
  execSync('git push origin main', { stdio: 'inherit' })
} catch (e) {
  console.log('Nothing to commit or push.')
}