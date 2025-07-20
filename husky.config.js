module.exports = {
  hooks: {
    'pre-commit': 'lint-staged',
    'pre-push': 'npm run type-check && npm run test:ci',
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS',
  },
};
