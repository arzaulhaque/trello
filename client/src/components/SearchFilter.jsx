import React, { useState, useEffect, useMemo } from 'react'
import useDebounce from '../hooks/useDebounce'
import * as api from '../services/api'
import './SearchFilter.css'

export default function SearchFilter({ lists, onFilter }) {
  const [query, setQuery] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [memberFilter, setMemberFilter] = useState('')
  const [dueDateFilter, setDueDateFilter] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  // Collect all unique labels and members from all cards
  const { allLabels, allMembers } = useMemo(() => {
    const labelsMap = new Map()
    const membersMap = new Map()
    for (const list of lists) {
      for (const card of list.cards || []) {
        for (const l of card.labels || []) labelsMap.set(l.id, l)
        for (const m of card.members || []) membersMap.set(m.id, m)
      }
    }
    return {
      allLabels: Array.from(labelsMap.values()),
      allMembers: Array.from(membersMap.values()),
    }
  }, [lists])

  useEffect(() => {
    const hasFilter = debouncedQuery || labelFilter || memberFilter || dueDateFilter
    if (!hasFilter) {
      onFilter(null)
      return
    }

    const matchingIds = new Set()
    for (const list of lists) {
      for (const card of list.cards || []) {
        let match = true

        if (debouncedQuery) {
          const q = debouncedQuery.toLowerCase()
          if (!card.title.toLowerCase().includes(q)) match = false
        }

        if (labelFilter && match) {
          const hasLabel = (card.labels || []).some((l) => String(l.id) === labelFilter)
          if (!hasLabel) match = false
        }

        if (memberFilter && match) {
          const hasMember = (card.members || []).some((m) => String(m.id) === memberFilter)
          if (!hasMember) match = false
        }

        if (dueDateFilter && match) {
          if (!card.due_date) {
            match = false
          } else {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const due = new Date(card.due_date)
            if (dueDateFilter === 'overdue' && due >= today) match = false
            if (dueDateFilter === 'today') {
              const tomorrow = new Date(today)
              tomorrow.setDate(today.getDate() + 1)
              if (due < today || due >= tomorrow) match = false
            }
            if (dueDateFilter === 'week') {
              const nextWeek = new Date(today)
              nextWeek.setDate(today.getDate() + 7)
              if (due < today || due >= nextWeek) match = false
            }
          }
        }

        if (match) matchingIds.add(card.id)
      }
    }
    onFilter(matchingIds)
  }, [debouncedQuery, labelFilter, memberFilter, dueDateFilter, lists, onFilter])

  const clearFilters = () => {
    setQuery('')
    setLabelFilter('')
    setMemberFilter('')
    setDueDateFilter('')
    onFilter(null)
  }

  const hasActiveFilter = query || labelFilter || memberFilter || dueDateFilter

  return (
    <div className="search-filter">
      <input
        className="search-input"
        type="search"
        placeholder="🔍 Search cards…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {allLabels.length > 0 && (
        <select
          className="filter-select"
          value={labelFilter}
          onChange={(e) => setLabelFilter(e.target.value)}
        >
          <option value="">All Labels</option>
          {allLabels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      )}

      {allMembers.length > 0 && (
        <select
          className="filter-select"
          value={memberFilter}
          onChange={(e) => setMemberFilter(e.target.value)}
        >
          <option value="">All Members</option>
          {allMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.username}
            </option>
          ))}
        </select>
      )}

      <select
        className="filter-select"
        value={dueDateFilter}
        onChange={(e) => setDueDateFilter(e.target.value)}
      >
        <option value="">Any Due Date</option>
        <option value="overdue">Overdue</option>
        <option value="today">Due Today</option>
        <option value="week">Due This Week</option>
      </select>

      {hasActiveFilter && (
        <button className="clear-filter-btn" onClick={clearFilters}>
          Clear filters
        </button>
      )}
    </div>
  )
}
