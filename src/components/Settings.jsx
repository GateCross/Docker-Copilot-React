import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, RefreshCw, Download, Server, Key, Bell } from 'lucide-react'
import { versionAPI } from '../api/client.js'
import { cn } from '../utils/cn.js'

export function Settings() {
  const [versionInfo, setVersionInfo] = useState({ local: '', remote: '' })
  const [isUpdating, setIsUpdating] = useState(false)
  const [apiKey, setApiKey] = useState('')

  // 组件加载时获取本地版本
  useEffect(() => {
    fetchVersionInfo('local')
  }, [])

  const fetchVersionInfo = async (type) => {
    try {
      const response = await versionAPI.getVersion(type)
      console.log(`获取${type}版本响应:`, response.data)

      // 处理响应数据 - 兼容多种返回格式
      if (response.data.code === 200 || response.data.code === 0) {
        // 优先使用data字段,其次使用msg字段
        let versionData = response.data.data || response.data.msg || ''

        // 如果data是对象,尝试提取version字段
        if (typeof versionData === 'object') {
          versionData = versionData.version || JSON.stringify(versionData)
        }

        setVersionInfo(prev => ({ 
          ...prev, 
          [type]: String(versionData)
        }))
      } else {
        console.error('获取版本信息失败:', response.data.msg)
        setVersionInfo(prev => ({ 
          ...prev, 
          [type]: '获取失败' 
        }))
      }
    } catch (error) {
      console.error('获取版本信息失败:', error)
      setVersionInfo(prev => ({ 
        ...prev, 
        [type]: '获取失败' 
      }))
    }
  }

  const handleUpdateProgram = async () => {
    try {
      setIsUpdating(true)
      const response = await versionAPI.updateProgram()
      if (response.data.code === 200 || response.data.code === 0) {
        alert('程序更新成功！')
        // 更新成功后重新获取版本信息
        setTimeout(() => {
          fetchVersionInfo('local')
        }, 1000)
      } else {
        alert(`更新失败: ${response.data.msg}`)
      }
    } catch (error) {
      console.error('更新程序失败:', error)
      alert(`更新程序失败: ${error.response?.data?.msg || error.message}`)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* 系统信息 */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Server className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">系统信息</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                后端地址
              </label>
              <div className="input bg-gray-50 dark:bg-gray-700">
                http://192.168.50.4:12712
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                前端版本
              </label>
              <div className="input bg-gray-50 dark:bg-gray-700">
                v1.0.0
              </div>
            </div>
          </div>
        </div>

        {/* 版本管理 */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">版本管理</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  本地版本
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={versionInfo.local}
                    placeholder="点击获取版本信息"
                    className="input flex-1"
                    readOnly
                  />
                  <button
                    onClick={() => fetchVersionInfo('local')}
                    className="btn-secondary"
                  >
                    获取
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  远程版本
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={versionInfo.remote}
                    placeholder="点击获取版本信息"
                    className="input flex-1"
                    readOnly
                  />
                  <button
                    onClick={() => fetchVersionInfo('remote')}
                    className="btn-secondary"
                  >
                    获取
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleUpdateProgram}
              disabled={isUpdating}
              className={cn(
                'btn-primary w-full',
                isUpdating && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>更新中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>更新程序</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">通知设置</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  容器状态变更通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  当容器启动、停止或重启时发送通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  镜像更新通知
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  当有新的镜像版本可用时发送通知
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* API设置 */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API设置</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API密钥
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入新的API密钥"
                  className="input flex-1"
                />
                <button className="btn-primary">
                  保存
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ 修改API密钥会影响所有使用该密钥的客户端连接
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}