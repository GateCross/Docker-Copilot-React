import React from 'react'
import { 
  Box, 
  HardDrive, 
  LogOut, 
  Menu, 
  X,
  Server,
  Image,
  Settings,
  DatabaseBackup
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle.jsx'
import { cn } from '../utils/cn.js'

export function Sidebar({ activeTab, onTabChange, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const navItems = [
    {
      id: '#containers',
      label: '容器',
      icon: Server,
    },
    {
      id: '#images',
      label: '镜像',
      icon: Image,
    },
    {
      id: '#backups',
      label: '备份',
      icon: DatabaseBackup,
    },
    {
      id: '#settings',
      label: '设置',
      icon: Settings,
    },
  ]

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* 侧边栏遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Box className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Docker Copilot</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">容器管理平台</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onTabChange(item.id)
                        setIsMobileMenuOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                        activeTab === item.id
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 底部 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="退出登录"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Docker Copilot v1.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}