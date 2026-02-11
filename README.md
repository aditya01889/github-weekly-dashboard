# GitHub Weekly Performance Dashboard

A Next.js dashboard that tracks and displays weekly GitHub performance metrics with GitHub OAuth authentication.

## Features

- **GitHub OAuth Authentication** - Secure login with GitHub
- **Weekly Metrics** - Tracks metrics from Monday to Sunday
- **Activity Metrics**: Commits, PRs opened/merged, features completed
- **Combat Metrics**: Bugs found/fixed, open bugs, bug fix ratio
- **Defense Metrics**: Tests written, CI runs
- **Repository Filtering** - Filter metrics by specific repository
- **Responsive Design** - Works on desktop and mobile
- **No Database** - Live aggregation from GitHub API

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js for GitHub OAuth
- Octokit for GitHub API
- Date-fns for date handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- GitHub OAuth App

### Setup

1. **Clone and install dependencies**
   ```bash
   cd github-weekly-dashboard
   npm install
   ```

2. **Create GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Environment Variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your GitHub OAuth credentials:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Metrics Explained

### Activity
- **Commits**: Commits authored by you within the week
- **PR Opened**: Pull requests created by you within the week  
- **PR Merged**: Pull requests merged within the week authored by you
- **Features Completed**: Issues closed with "feature" label within the week

### Combat
- **Bugs Found**: Issues created with "bug" label within the week
- **Bugs Fixed**: Issues closed with "bug" label within the week
- **Open Bugs**: Currently open issues with "bug" label
- **Bug Fix Ratio**: Bugs Fixed / Bugs Found (or Bugs Fixed if none found)

### Defense
- **Tests Written**: Commits modifying test files within the week
- **CI Runs**: GitHub Actions workflow runs within the week

## Repository Scope

- Includes repositories where you are owner or contributor
- Includes private repositories
- Excludes forked repositories
- All metrics respect weekly boundaries (Monday-Sunday)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Yes |
| `NEXTAUTH_URL` | Your app's URL | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |

## API Endpoints

### GET /api/weekly-metrics

Returns weekly metrics for authenticated user.

**Query Parameters:**
- `repo` (optional): Repository name or "all" (default)

**Response:**
```json
{
  "weekRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-07T23:59:59Z",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-07T23:59:59.999Z"
  },
  "repositories": ["owner/repo1", "owner/repo2"],
  "metrics": {
    "activity": { ... },
    "combat": { ... },
    "defense": { ... }
  },
  "user": {
    "username": "username",
    "name": "Display Name",
    "avatar": "https://avatars.githubusercontent.com/u/..."
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
