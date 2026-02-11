#!/bin/bash

# GitHub Weekly Performance Dashboard - Deployment Script

echo "🚀 Deploying GitHub Weekly Performance Dashboard to Vercel..."

# Step 1: Commit and push to GitHub
echo "📦 Committing changes..."
git add .
git commit -m "feat: Complete GitHub Weekly Performance Dashboard MVP

- GitHub OAuth authentication
- Weekly metrics calculation (Activity, Combat, Defense)
- Repository filtering
- Responsive UI with Tailwind CSS
- Ready for Vercel deployment"

echo "📤 Pushing to GitHub..."
git push origin main

# Step 2: Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Update GitHub OAuth App callback URL"
echo "3. Test the deployed application"
