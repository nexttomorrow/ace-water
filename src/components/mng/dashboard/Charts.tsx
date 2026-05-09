'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

type MonthlyDataset = {
  label: string
  data: number[]
  color: string
}

export function MonthlyTrendChart({
  labels,
  datasets,
}: {
  labels: string[]
  datasets: MonthlyDataset[]
}) {
  return (
    <div className="h-[320px]">
      <Line
        data={{
          labels,
          datasets: datasets.map((d) => ({
            label: d.label,
            data: d.data,
            borderColor: d.color,
            backgroundColor: hexA(d.color, 0.12),
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            fill: true,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 11 },
                boxWidth: 10,
                boxHeight: 10,
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  `${ctx.dataset.label}: ${formatNumber(ctx.parsed.y ?? 0)}`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { size: 11 },
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  )
}

export function MonthlyBarChart({
  labels,
  data,
  label,
  color,
}: {
  labels: string[]
  data: number[]
  label: string
  color: string
}) {
  return (
    <div className="h-[260px]">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              backgroundColor: hexA(color, 0.85),
              borderRadius: 6,
              maxBarThickness: 28,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${formatNumber(ctx.parsed.y ?? 0)} 건`,
              },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { font: { size: 11 }, precision: 0 },
            },
          },
        }}
      />
    </div>
  )
}

export function StatusDoughnut({
  rows,
}: {
  rows: { label: string; count: number }[]
}) {
  const palette = ['#2563eb', '#f59e0b', '#10b981', '#a3a3a3']
  return (
    <div className="relative h-[260px]">
      <Doughnut
        data={{
          labels: rows.map((r) => r.label),
          datasets: [
            {
              data: rows.map((r) => r.count),
              backgroundColor: palette,
              borderColor: '#fff',
              borderWidth: 2,
              hoverOffset: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 11 },
                usePointStyle: true,
                boxWidth: 10,
                boxHeight: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const total = (ctx.dataset.data as number[]).reduce(
                    (a, b) => a + b,
                    0
                  )
                  const v = ctx.parsed
                  const pct = total === 0 ? 0 : (v / total) * 100
                  return `${ctx.label}: ${formatNumber(v)} 건 (${pct.toFixed(1)}%)`
                },
              },
            },
          },
        }}
      />
    </div>
  )
}

function formatNumber(n: number) {
  return n.toLocaleString('ko-KR')
}

function hexA(hex: string, alpha: number) {
  // #rrggbb → rgba()
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const r = parseInt(m[1].slice(0, 2), 16)
  const g = parseInt(m[1].slice(2, 4), 16)
  const b = parseInt(m[1].slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
