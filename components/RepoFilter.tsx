'use client'

import { useState, useEffect } from 'react'

interface RepoFilterProps {
  selectedRepo: string
  onRepoChange: (repo: string) => void
  repositories: string[]
}

export function RepoFilter({ selectedRepo, onRepoChange, repositories }: RepoFilterProps) {
  return (
    <div className="mb-6">
      <label htmlFor="repo-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Repository Filter
      </label>
      <select
        id="repo-filter"
        value={selectedRepo}
        onChange={(e) => onRepoChange(e.target.value)}
        className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Repositories</option>
        {repositories.map((repo) => (
          <option key={repo} value={repo}>
            {repo}
          </option>
        ))}
      </select>
    </div>
  )
}
