import { Octokit } from '@octokit/rest'
import { startOfWeek, endOfWeek, format } from 'date-fns'

export interface WeeklyMetrics {
  activity: {
    commits: number
    prOpened: number
    prMerged: number
    featuresCompleted: number
  }
  combat: {
    bugsFound: number
    bugsFixed: number
    openBugs: number
    bugFixRatio: number
  }
  defense: {
    testsWritten: number
    ciRuns: number
  }
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  private: boolean
  fork: boolean
  owner: {
    login: string
  }
}

export class GitHubService {
  private octokit: Octokit

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken })
  }

  async getUserRepos(): Promise<GitHubRepo[]> {
    const repos: GitHubRepo[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser({
        per_page: perPage,
        page: page,
        type: 'all'
      })

      if (response.data.length === 0) break

      repos.push(...response.data.filter(repo => !repo.fork))
      page++

      if (response.data.length < perPage) break
    }

    return repos
  }

  getWeekRange(date: Date = new Date(), weeksAgo: number = 0) {
    const targetDate = new Date(date)
    targetDate.setDate(targetDate.getDate() - (weeksAgo * 7))
    const start = startOfWeek(targetDate, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(targetDate, { weekStartsOn: 1 }) // Sunday
    
    return {
      start: format(start, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      end: format(end, "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      startDate: start,
      endDate: end
    }
  }

  async getCommitsForWeek(repo: string, username: string, weekRange: ReturnType<typeof this.getWeekRange>): Promise<number> {
    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        author: username,
        since: weekRange.start,
        until: weekRange.end,
        per_page: 100
      })

      return response.data.length
    } catch (error) {
      console.error(`Error fetching commits for ${repo}:`, error)
      return 0
    }
  }

  async getPRsForWeek(repo: string, username: string, weekRange: ReturnType<typeof this.getWeekRange>): Promise<{ opened: number; merged: number }> {
    try {
      const [openedResponse, mergedResponse] = await Promise.all([
        this.octokit.rest.pulls.list({
          owner: repo.split('/')[0],
          repo: repo.split('/')[1],
          creator: username,
          state: 'all',
          created: `>=${weekRange.start}`,
          per_page: 100
        }),
        this.octokit.rest.pulls.list({
          owner: repo.split('/')[0],
          repo: repo.split('/')[1],
          author: username,
          state: 'closed',
          merged: '>=',
          merged_at: `>=${weekRange.start}`,
          per_page: 100
        })
      ])

      return {
        opened: openedResponse.data.length,
        merged: mergedResponse.data.filter(pr => pr.merged_at).length
      }
    } catch (error) {
      console.error(`Error fetching PRs for ${repo}:`, error)
      return { opened: 0, merged: 0 }
    }
  }

  async getIssuesForWeek(repo: string, username: string, weekRange: ReturnType<typeof this.getWeekRange>): Promise<{ featuresCompleted: number; bugsFound: number; bugsFixed: number }> {
    try {
      const [allIssuesResponse, closedIssuesResponse] = await Promise.all([
        this.octokit.rest.issues.listForRepo({
          owner: repo.split('/')[0],
          repo: repo.split('/')[1],
          creator: username,
          state: 'all',
          created: `>=${weekRange.start}`,
          per_page: 100
        }),
        this.octokit.rest.issues.listForRepo({
          owner: repo.split('/')[0],
          repo: repo.split('/')[1],
          state: 'closed',
          closed_by: username,
          closed_at: `>=${weekRange.start}`,
          per_page: 100
        })
      ])

      const bugsFound = allIssuesResponse.data.filter(issue => 
        issue.labels.some(label => 
          typeof label === 'object' && label.name?.toLowerCase().includes('bug')
        )
      ).length

      const bugsFixed = closedIssuesResponse.data.filter(issue => 
        issue.labels.some(label => 
          typeof label === 'object' && label.name?.toLowerCase().includes('bug')
        )
      ).length

      const featuresCompleted = closedIssuesResponse.data.filter(issue => 
        issue.labels.some(label => 
          typeof label === 'object' && label.name?.toLowerCase().includes('feature')
        )
      ).length

      return {
        featuresCompleted,
        bugsFound,
        bugsFixed
      }
    } catch (error) {
      console.error(`Error fetching issues for ${repo}:`, error)
      return { featuresCompleted: 0, bugsFound: 0, bugsFixed: 0 }
    }
  }

  async getOpenBugs(repo: string): Promise<number> {
    try {
      const response = await this.octokit.rest.issues.listForRepo({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        state: 'open',
        labels: 'bug',
        per_page: 100
      })

      return response.data.length
    } catch (error) {
      console.error(`Error fetching open bugs for ${repo}:`, error)
      return 0
    }
  }

  async getTestCommits(repo: string, username: string, weekRange: ReturnType<typeof this.getWeekRange>): Promise<number> {
    try {
      const response = await this.octokit.rest.repos.listCommits({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        author: username,
        since: weekRange.start,
        until: weekRange.end,
        per_page: 100
      })

      const testCommits = await Promise.all(
        response.data.map(async (commit) => {
          try {
            const commitDetail = await this.octokit.rest.repos.getCommit({
              owner: repo.split('/')[0],
              repo: repo.split('/')[1],
              ref: commit.sha
            })

            return commitDetail.data.files?.some(file => 
              file.filename?.includes('/test/') || 
              file.filename?.includes('/tests/') || 
              file.filename?.includes('.test.') || 
              file.filename?.includes('.spec.')
            ) ? 1 : 0
          } catch {
            return 0
          }
        })
      )

      return testCommits.reduce((sum: number, count: number) => sum + count, 0)
    } catch (error) {
      console.error(`Error fetching test commits for ${repo}:`, error)
      return 0
    }
  }

  async getWorkflowRuns(repo: string, weekRange: ReturnType<typeof this.getWeekRange>): Promise<number> {
    try {
      const response = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner: repo.split('/')[0],
        repo: repo.split('/')[1],
        created: `>=${weekRange.start}`,
        per_page: 100
      })

      return response.data.workflow_runs.length
    } catch (error) {
      console.error(`Error fetching workflow runs for ${repo}:`, error)
      return 0
    }
  }

  async calculateWeeklyMetrics(repos: GitHubRepo[], username: string, weekRange: ReturnType<typeof this.getWeekRange>): Promise<WeeklyMetrics> {
    const metrics: WeeklyMetrics = {
      activity: {
        commits: 0,
        prOpened: 0,
        prMerged: 0,
        featuresCompleted: 0
      },
      combat: {
        bugsFound: 0,
        bugsFixed: 0,
        openBugs: 0,
        bugFixRatio: 0
      },
      defense: {
        testsWritten: 0,
        ciRuns: 0
      }
    }

    for (const repo of repos) {
      const repoFullName = repo.full_name
      
      const [commits, prs, issues, openBugs, testCommits, workflowRuns] = await Promise.all([
        this.getCommitsForWeek(repoFullName, username, weekRange),
        this.getPRsForWeek(repoFullName, username, weekRange),
        this.getIssuesForWeek(repoFullName, username, weekRange),
        this.getOpenBugs(repoFullName),
        this.getTestCommits(repoFullName, username, weekRange),
        this.getWorkflowRuns(repoFullName, weekRange)
      ])

      metrics.activity.commits += commits
      metrics.activity.prOpened += prs.opened
      metrics.activity.prMerged += prs.merged
      metrics.activity.featuresCompleted += issues.featuresCompleted
      
      metrics.combat.bugsFound += issues.bugsFound
      metrics.combat.bugsFixed += issues.bugsFixed
      metrics.combat.openBugs += openBugs
      
      metrics.defense.testsWritten += testCommits
      metrics.defense.ciRuns += workflowRuns
    }

    metrics.combat.bugFixRatio = metrics.combat.bugsFound > 0 
      ? metrics.combat.bugsFixed / metrics.combat.bugsFound 
      : metrics.combat.bugsFixed

    return metrics
  }
}
