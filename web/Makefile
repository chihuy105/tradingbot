.PHONY: help deps build vercel-build vercel-link vercel-preview vercel-prod vercel-open

SHELL := /bin/bash
.ONESHELL:
.DEFAULT_GOAL := help

VERCEL ?= vercel
VERCEL_PROJECT ?= llmbot
VERCEL_ORG ?= team_RBkPYJXrE84gduWtEI6YukKV
NODE_ENV ?= production

VERCEL_SCOPE := $(if $(VERCEL_ORG),--scope $(VERCEL_ORG),)
ifdef VERCEL_TOKEN
VERCEL_TOKEN_FLAG := --token $(VERCEL_TOKEN)
endif
VERCEL_FLAGS := $(strip $(VERCEL_SCOPE) $(VERCEL_TOKEN_FLAG))

help: ## Display this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

deps: ## Install Node.js dependencies
	npm ci

build: deps ## Run the Next.js production build
	NODE_ENV=$(NODE_ENV) npm run build

vercel-build: build ## Generate the Vercel output bundle locally
	NODE_ENV=$(NODE_ENV) $(VERCEL) build --prod $(VERCEL_FLAGS)

vercel-link: ## Link this directory to the configured Vercel project
	$(VERCEL) link --yes --project $(VERCEL_PROJECT) $(VERCEL_SCOPE)

vercel-preview: vercel-build ## Deploy the build as a preview deployment
	$(VERCEL) deploy --prebuilt --yes $(VERCEL_FLAGS)

vercel-prod: vercel-build ## Deploy the build to production
	$(VERCEL) deploy --prod --prebuilt --yes $(VERCEL_FLAGS)

vercel-open: ## Open the latest production deployment in the browser
	$(VERCEL) open --prod $(VERCEL_FLAGS)
