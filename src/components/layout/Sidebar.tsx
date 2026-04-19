'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Briefcase, Mail, Mic, Star, FileText, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '儀表板', icon: LayoutDashboard },
  { href: '/kols', label: '業績追蹤', icon: Users },
  { href: '/projects', label: '合作排程', icon: Briefcase },
  { href: '/invitations', label: '邀約名單', icon: Mail },
  { href: '/podcasts', label: 'Podcast', icon: Mic },
  { href: '/endorsers', label: '代言人', icon: Star },
  { href: '/reports', label: '週報 / 月報', icon: FileText },
  { href: '/settings', label: '設定', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-brand-light border-r border-brand/20 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-brand/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
            <span className="text-white text-sm font-bold">淨</span>
          </div>
          <div>
            <p className="font-bold text-brand text-sm leading-tight">淨淨 CleanClean</p>
            <p className="text-xs text-brand/60">團購儀表板</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-brand text-white font-medium'
                  : 'text-brand hover:bg-brand/10'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-brand/20">
        <p className="text-xs text-brand/40">天泉草本國際股份有限公司</p>
      </div>
    </aside>
  )
}
