set shell := ["zsh", "-cu"]

install:
    pnpm install

dev:
    pnpm dev

check:
    pnpm check

build:
    pnpm build

preview:
    pnpm preview

verify: check build
