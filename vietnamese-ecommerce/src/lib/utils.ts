import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function formatDate(date: Date, locale: string = 'ja-JP'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `VF-${timestamp}-${randomStr}`.toUpperCase()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\-\+\(\)\s]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function getSpiceLevelText(level: number, language: 'ja' | 'vi' = 'ja'): string {
  const levels = {
    ja: ['辛くない', '少し辛い', '辛い', 'かなり辛い', '激辛', '超激辛'],
    vi: ['Không cay', 'Hơi cay', 'Cay', 'Rất cay', 'Cực cay', 'Siêu cay']
  }
  return levels[language][level] || levels[language][0]
}

export function getStorageTypeText(type: string, language: 'ja' | 'vi' = 'ja'): string {
  const types = {
    ja: {
      frozen: '冷凍',
      refrigerated: '冷蔵',
      ambient: '常温'
    },
    vi: {
      frozen: 'Đông lạnh',
      refrigerated: 'Mát',
      ambient: 'Nhiệt độ phòng'
    }
  }
  return types[language][type as keyof typeof types.ja] || type
}