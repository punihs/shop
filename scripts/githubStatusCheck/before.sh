#!/usr/bin/env bash
GIT_COMMIT=$(git rev-parse HEAD)
curl "https://api.github.com/repos/shoppre/api/statuses/$GIT_COMMIT?access_token=7a22c7cf18addb1df993341ed4eab843b2ca04bc" \
  -H "Content-Type: application/json" \
  -X "POST" \
  -d "{\"state\": \"pending\", \"context\": \"continuous-integration/sequelize\", \"description\": \"Sequelize\", \"target_url\": \"https://pulse.shoppre.com\"}"
