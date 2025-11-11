import React, { useState, useEffect } from 'react'
import { 
  HardDrive, 
  SquarePlus, 
  CirclePlus, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  List,
  Calendar,
  RotateCcw,
  FileCode,
  Save
} from 'lucide-react'
import { containerAPI } from '../api/client.js'
import { cn } from '../utils/cn.js'

export function Backups() {
  const [backups, setBackups] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'timeline'
  const [isLoading, setIsLoading] = useState(true)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchBackups = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await containerAPI.listBackups()
      if (response.data && (response.data.code === 0 || response.data.code === 200)) {
        setBackups(response.data.data || [])
      } else {
        setError(response.data?.msg || '获取备份列表失败')
        setBackups([])
      }
    } catch (error) {
      setError(error.response?.data?.msg || error.message || '网络错误，请检查后端服务')
      setBackups([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBackups()
  }, [])

  const handleBackup = async () => {
    try {
      setIsBackingUp(true)
      setSuccess(null)
      setError(null)
      
      const response = await containerAPI.backupContainer()
      if (response.data && (response.data.code === 0 || response.data.code === 200)) {
        setSuccess('备份创建成功')
        // 刷新备份列表
        fetchBackups()
      } else {
        setError(response.data?.msg || '备份创建失败')
      }
    } catch (error) {
      setError(error.response?.data?.msg || error.message || '备份创建失败')
    } finally {
      setIsBackingUp(false)
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleBackupToCompose = async () => {
    try {
      setIsBackingUp(true)
      setSuccess(null)
      setError(null)
      
      const response = await containerAPI.backupToCompose()
      if (response.data && (response.data.code === 0 || response.data.code === 200)) {
        setSuccess('Compose备份创建成功')
        // 刷新备份列表
        fetchBackups()
      } else {
        setError(response.data?.msg || 'Compose备份创建失败')
      }
    } catch (error) {
      setError(error.response?.data?.msg || error.message || 'Compose备份创建失败')
    } finally {
      setIsBackingUp(false)
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleRestore = async (filename) => {
    try {
      if (!window.confirm(`确定要恢复备份文件 ${filename} 吗？这将覆盖当前容器配置。`)) {
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      const response = await containerAPI.restoreContainer(filename)
      if (response.data && (response.data.code === 0 || response.data.code === 200)) {
        setSuccess(`备份 ${filename} 恢复成功`)
      } else {
        setError(response.data?.msg || `备份 ${filename} 恢复失败`)
      }
    } catch (error) {
      setError(error.response?.data?.msg || error.message || `备份 ${filename} 恢复失败`)
    } finally {
      setIsLoading(false)
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(null), 3000)
      
      // 刷新备份列表
      fetchBackups()
    }
  }

  const handleDelete = async (filename) => {
    try {
      if (!window.confirm(`确定要删除备份文件 ${filename} 吗？此操作不可恢复。`)) {
        return
      }
      
      setIsLoading(true)
      setError(null)
      
      const response = await containerAPI.deleteBackup(filename)
      if (response.data && (response.data.code === 0 || response.data.code === 200)) {
        setSuccess(`备份 ${filename} 删除成功`)
        // 从列表中移除已删除的备份
        setBackups(backups.filter(backup => backup !== filename))
      } else {
        setError(response.data?.msg || `备份 ${filename} 删除失败`)
      }
    } catch (error) {
      setError(error.response?.data?.msg || error.message || `备份 ${filename} 删除失败`)
    } finally {
      setIsLoading(false)
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const getFileType = (filename) => {
    if (filename.endsWith('.json')) return 'JSON'
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'YAML'
    return '未知'
  }

  const formatFilename = (filename) => {
    // 移除文件扩展名
    return filename.replace(/\.(json|yaml|yml)$/i, '')
  }

  // 按日期分组备份文件（用于时间线视图）
  const groupBackupsByDate = (backupList) => {
    const groups = {}
    
    backupList.forEach(backup => {
      // 从文件名中提取日期部分
      const dateMatch = backup.match(/backup-(\d{4}-\d{2}-\d{2})/)
      const date = dateMatch ? dateMatch[1] : '未知日期'
      
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(backup)
    })
    
    // 转换为数组并按日期排序（最新的在前）
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
  }

  // 获取备份文件的日期
  const getBackupDate = (filename) => {
    const dateMatch = filename.match(/backup-(\d{4}-\d{2}-\d{2})/)
    return dateMatch ? dateMatch[1] : '未知日期'
  }

  if (isLoading && backups.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">备份管理</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理您的容器备份，包括创建、恢复和删除备份文件
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleBackupToCompose}
            disabled={isBackingUp}
            className="btn-secondary flex items-center"
          >
            <FileCode className={`h-4 w-4 mr-2 ${isBackingUp ? 'animate-spin' : ''}`} />
            YAML
          </button>
          <button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="btn-secondary flex items-center"
          >
            <Save className={`h-4 w-4 mr-2 ${isBackingUp ? 'animate-spin' : ''}`} />
            JSON
          </button>
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "px-3 py-2 text-sm",
                viewMode === 'list' 
                  ? "bg-primary-600 text-white" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              title="列表视图"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={cn(
                "px-3 py-2 text-sm",
                viewMode === 'timeline' 
                  ? "bg-primary-600 text-white" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
              title="时间线视图"
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={fetchBackups}
            disabled={isLoading}
            className="btn-primary flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 状态消息 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
          <span className="text-green-800 dark:text-green-200">{success}</span>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {backups.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">总备份数</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {backups.filter(b => b.endsWith('.json')).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">JSON备份</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {backups.filter(b => b.endsWith('.yaml') || b.endsWith('.yml')).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">YAML备份</div>
        </div>
      </div>

      {/* 备份列表 - 列表视图 */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {groupBackupsByDate(backups).map(([date, dateBackups]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {date}
                </h3>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({dateBackups.length} 个备份)
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dateBackups.map((backup) => (
                  <div key={backup} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <HardDrive className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {formatFilename(backup)}
                            </h4>
                            <span className="badge-info text-xs">
                              {getFileType(backup)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {backup}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end mt-3 space-x-2">
                      <button
                        onClick={() => handleRestore(backup)}
                        className="btn-secondary py-1 px-3 text-xs flex items-center"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        恢复
                      </button>
                      <button
                        onClick={() => handleDelete(backup)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="删除备份"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 备份列表 - 时间线视图 */}
      {viewMode === 'timeline' && (
        <div className="space-y-8">
          {groupBackupsByDate(backups).map(([date, dateBackups]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {date}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dateBackups.length} 个备份
                  </p>
                </div>
              </div>
              
              <div className="ml-8 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
                {dateBackups.map((backup) => (
                  <div key={backup} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <HardDrive className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {formatFilename(backup)}
                            </h4>
                            <span className="badge-info text-xs">
                              {getFileType(backup)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {backup}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRestore(backup)}
                          className="btn-secondary py-1 px-3 text-xs flex items-center"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          恢复
                        </button>
                        <button
                          onClick={() => handleDelete(backup)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="删除备份"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {backups.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <HardDrive className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无备份</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            点击"创建备份"按钮创建您的第一个容器备份
          </p>
        </div>
      )}
    </div>
  )
}