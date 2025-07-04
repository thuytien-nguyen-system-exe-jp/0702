'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red'
}

function StatCard({ title, value, change, changeLabel, icon, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' && title.includes('売上') 
              ? `¥${value.toLocaleString()}` 
              : value.toLocaleString()}
          </p>
        </div>
        <div className={cn('p-3 rounded-full', colorClasses[color])}>
          {icon}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4">
          <span className={cn(
            'text-sm',
            change >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          {changeLabel && (
            <span className="text-sm text-gray-500 ml-2">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

interface DashboardStatsProps {
  stats: {
    todaySales: number
    todayOrders: number
    totalProducts: number
    activeUsers: number
    salesChange: number
    ordersChange: number
    productsChange: number
    usersChange: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="今日の売上"
        value={stats.todaySales}
        change={stats.salesChange}
        changeLabel="前日比"
        color="green"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        }
      />
      
      <StatCard
        title="今日の注文数"
        value={stats.todayOrders}
        change={stats.ordersChange}
        changeLabel="前日比"
        color="blue"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        }
      />
      
      <StatCard
        title="総商品数"
        value={stats.totalProducts}
        change={stats.productsChange}
        changeLabel="前月比"
        color="purple"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      
      <StatCard
        title="アクティブユーザー"
        value={stats.activeUsers}
        change={stats.usersChange}
        changeLabel="前月比"
        color="orange"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        }
      />
    </div>
  )
}