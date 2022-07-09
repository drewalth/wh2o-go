#!/bin/zsh

# Requires https://github.com/caarlos0/svu
git tag "$(svu next)"
git push --tags