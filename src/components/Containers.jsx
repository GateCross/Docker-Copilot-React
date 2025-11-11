import React, { useState } from 'react'
import { 
  Play, 
  Square, 
  RotateCcw, 
  RefreshCw, 
  Edit3, 
  Download,
  Upload,
  Trash2,
  MoreVertical,
  Clock,
  Calendar,
  Package
} from 'lucide-react'
import { containerAPI } from '../api/client.js'
import { cn } from '../utils/cn.js'

export function Containers() {
  const [containers, setContainers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [showActions, setShowActions] = useState(null)

  React.useEffect(() => {
    // 实际调用后端API
    const fetchContainers = async () => {
      try {
        setIsLoading(true)
        const response = await containerAPI.getContainers()
        if (response.data.code === 0) {
          setContainers(response.data.data)
        } else {
          console.error('获取容器列表失败:', response.data.msg)
        }
      } catch (error) {
        console.error('获取容器列表失败:', error)
        // 如果API调用失败，显示错误信息
        if (error.response?.status === 401) {
          console.error('认证失败，请重新登录')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchContainers()
  }, [])

  const handleContainerAction = async (containerId, action) => {
    try {
      setShowActions(null)
      
      switch (action) {
        case 'start':
          await containerAPI.startContainer(containerId)
          break
        case 'stop':
          await containerAPI.stopContainer(containerId)
          break
        case 'restart':
          await containerAPI.restartContainer(containerId)
          break
        default:
          break
      }
      
      // 刷新容器列表
      const response = await containerAPI.getContainers()
      if (response.data.code === 0) {
        setContainers(response.data.data)
      }
    } catch (error) {
      console.error('操作失败:', error)
      if (error.response?.status === 401) {
        console.error('认证失败，请重新登录')
      }
    }
  }

  const handleRenameContainer = async (containerId, newName) => {
    try {
      await containerAPI.renameContainer(containerId, newName)
      // 刷新容器列表
      const response = await containerAPI.getContainers()
      if (response.data.code === 0) {
        setContainers(response.data.data)
      }
    } catch (error) {
      console.error('重命名容器失败:', error)
    }
  }

  const handleUpdateContainer = async (containerId, imageNameAndTag, containerName, delOldContainer) => {
    try {
      await containerAPI.updateContainer(containerId, imageNameAndTag, containerName, delOldContainer)
      // 刷新容器列表
      const response = await containerAPI.getContainers()
      if (response.data.code === 0) {
        setContainers(response.data.data)
      }
    } catch (error) {
      console.error('更新容器失败:', error)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      running: { label: '运行中', className: 'badge-success' },
      stopped: { label: '已停止', className: 'badge-error' },
      restarting: { label: '重启中', className: 'badge-warning' },
      paused: { label: '已暂停', className: 'badge-info' }
    }
    
    const config = statusConfig[status] || { label: status, className: 'badge-info' }
    
    return (
      <span className={cn('badge', config.className)}>
        {config.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">容器管理</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理您的Docker容器，包括启动、停止、重启等操作
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            备份
          </button>
          <button className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </button>
        </div>
      </div>

      {/* 容器列表 */}
      <div className="space-y-4">
        {containers.map((container) => (
          <div key={container.id} className="card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {container.name}
                    </h3>
                    {container.haveUpdate && (
                      <span className="badge-warning">可更新</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {container.usingImage}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>创建: {new Date(container.createTime).toLocaleDateString()}</span>
                    </div>
                    {container.status === 'running' && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>运行: {container.runningTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusBadge(container.status)}
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(showActions === container.id ? null : container.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {showActions === container.id && (
                    <div className="absolute right-0 top-10 z-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      {container.status === 'running' ? (
                        <>
                          <button
                            onClick={() => handleContainerAction(container.id, 'stop')}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Square className="h-4 w-4" />
                            <span>停止</span>
                          </button>
                          <button
                            onClick={() => handleContainerAction(container.id, 'restart')}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>重启</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleContainerAction(container.id, 'start')}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Play className="h-4 w-4" />
                          <span>启动</span>
                        </button>
                      )}
                      
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Edit3 className="h-4 w-4" />
                        <span>重命名</span>
                      </button>
                      
                      {container.haveUpdate && (
                        <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Upload className="h-4 w-4" />
                          <span>更新容器</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {containers.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无容器</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            当前没有运行中的Docker容器
          </p>
        </div>
      )}
    </div>
  )
}