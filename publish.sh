#!/bin/bash

# Exit on error
set -e

echo "🚀 NPM Package Publisher"
echo "========================"
echo ""

# Check for pending git changes
echo "📋 Checking for pending git changes..."
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Error: You have uncommitted changes in your git repository."
    echo "Please commit or stash your changes before publishing."
    git status --short
    exit 1
fi
echo "✅ No pending changes detected"
echo ""

# Ask for version bump type
echo "📦 Select version bump type:"
echo "  1) patch (bug fixes, backwards compatible)"
echo "  2) minor (new features, backwards compatible)"
echo "  3) major (breaking changes)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and select 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🔢 Bumping version ($VERSION_TYPE)..."
bunx npm version $VERSION_TYPE

# Get the new version number
NEW_VERSION=$(bun -p "require('./package.json').version")
echo "✅ Version bumped to $NEW_VERSION"
echo ""

# Checking for erroris
echo "🔍 Checking for errors..."
bun run lint

# Checking dependencies
echo "🔍 Checking for outdated dependencies..."
bun run depcheck

# Build the project
echo "🔨 Building project..."
bun run build
echo "✅ Build completed successfully"
echo ""

# Login to npm
echo "🔐 Logging in to npm..."
echo "Please enter your npm credentials:"
bunx npm login
echo "✅ Logged in to npm"
echo ""


# Ask for confirmation before publishing
echo "📤 Ready to publish version $NEW_VERSION to npm"
echo ""
read -p "Are you sure you want to publish? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Publication cancelled"
    exit 1
fi

# Publish to npm
echo "📤 Publishing version $NEW_VERSION to npm..."
bun publish
echo ""
echo "🎉 Successfully published version $NEW_VERSION to npm!"
echo ""

# Ask whether to push to git
read -p "Do you want to push changes and tags to git? (y/N): " push_confirm

if [[ $push_confirm =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Pushing to git..."
    git push && git push --tags
    echo "✅ Successfully pushed to git!"
else
    echo "⚠️  Skipping git push. Don't forget to push later:"
    echo "  git push && git push --tags"
fi