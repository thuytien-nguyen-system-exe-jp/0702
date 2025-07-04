'use client'

import React from 'react'

interface SalesChartProps {
  data: {
    date: string
    sales: number
    orders: number
  }[]
}

export function SalesChart({ data }: SalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">売上推移</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    )
  }

  const maxSales = Math.max(...data.map(d => d.sales))
  const maxOrders = Math.max(...data.map(d => d.orders))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">売上推移（過去7日間）</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">売上</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">注文数</span>
          </div>
        </div>
      </div>

      <div className="relative h-64">
        {/* Y軸ラベル */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>¥{maxSales.toLocaleString()}</span>
          <span>¥{Math.round(maxSales * 0.75).toLocaleString()}</span>
          <span>¥{Math.round(maxSales * 0.5).toLocaleString()}</span>
          <span>¥{Math.round(maxSales * 0.25).toLocaleString()}</span>
          <span>¥0</span>
        </div>

        {/* チャートエリア */}
        <div className="ml-12 h-full relative">
          {/* グリッドライン */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-gray-200"></div>
            ))}
          </div>

          {/* バーチャート */}
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {data.map((item, index) => {
              const salesHeight = maxSales > 0 ? (item.sales / maxSales) * 100 : 0
              const ordersHeight = maxOrders > 0 ? (item.orders / maxOrders) * 100 : 0
              
              return (
                <div key={index} className="flex flex-col items-center space-y-1 flex-1 max-w-16">
                  {/* バー */}
                  <div className="relative w-full flex justify-center space-x-1">
                    {/* 売上バー */}
                    <div className="relative group">
                      <div
                        className="w-4 bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                        style={{ height: `${salesHeight}%` }}
                      ></div>
                      {/* ツールチップ */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        売上: ¥{item.sales.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* 注文数バー */}
                    <div className="relative group">
                      <div
                        className="w-4 bg-green-500 rounded-t transition-all duration-300 hover:bg-green-600"
                        style={{ height: `${ordersHeight}%` }}
                      ></div>
                      {/* ツールチップ */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        注文: {item.orders}件
                      </div>
                    </div>
                  </div>
                  
                  {/* 日付ラベル */}
                  <div className="text-xs text-gray-500 text-center">
                    {new Date(item.date).toLocaleDateString('ja-JP', { 
                      month: 'numeric', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">総売上: </span>
            <span className="font-semibold text-gray-900">
              ¥{data.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">総注文数: </span>
            <span className="font-semibold text-gray-900">
              {data.reduce((sum, item) => sum + item.orders, 0)}件
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}