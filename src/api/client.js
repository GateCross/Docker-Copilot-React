import axios from 'axios'

const API_BASE_URL = 'http://192.168.50.4:12712'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docker_copilot_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理认证过期
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 只在有token的情况下移除它
      if (localStorage.getItem('docker_copilot_token')) {
        localStorage.removeItem('docker_copilot_token')
        // 触发自定义事件通知应用认证状态变化
        window.dispatchEvent(new CustomEvent('authChange', { detail: { authenticated: false } }))
      }
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  login: (secretKey) => {
    const formData = new FormData()
    formData.append('secretKey', secretKey)
    return apiClient.post('/api/auth', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

// 版本相关API
export const versionAPI = {
  getVersion: (type) => {
    // 如果type参数为空，则不添加查询参数
    if (!type) {
      return apiClient.get('/api/version')
    }
    return apiClient.get(`/api/version?type=${type}`)
  },
  updateProgram: () => apiClient.put('/api/program'),
}

// 容器相关API
export const containerAPI = {
  getContainers: () => apiClient.get('/api/containers'),
  startContainer: (id) => apiClient.post(`/api/container/${id}/start`),
  stopContainer: (id) => apiClient.post(`/api/container/${id}/stop`),
  restartContainer: (id) => apiClient.post(`/api/container/${id}/restart`),
  renameContainer: (id, newName) => {
    const formData = new FormData()
    formData.append('newName', newName)
    return apiClient.post(`/api/container/${id}/rename`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  updateContainer: (id, imageNameAndTag, containerName, delOldContainer) => {
    const formData = new FormData()
    formData.append('imageNameAndTag', imageNameAndTag)
    formData.append('containerName', containerName)
    formData.append('delOldContainer', delOldContainer)
    return apiClient.post(`/api/container/${id}/update`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  backupContainer: () => apiClient.get('/api/container/backup'),
  listBackups: () => apiClient.get('/api/container/listBackups'),
  restoreContainer: (filename) => {
    const formData = new FormData()
    formData.append('filename', filename)
    return apiClient.post('/api/container/backups/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteBackup: (filename) => apiClient.delete(`/api/container/backups?filename=${filename}`),
  backupToCompose: () => apiClient.get('/api/container/backup2compose'),
}

// 镜像相关API
export const imageAPI = {
  getImages: () => apiClient.get('/api/images'),
  deleteImage: (id, force = false) => apiClient.delete(`/api/image/${id}?force=${force}`),
}

// 进度查询API
export const progressAPI = {
  getProgress: (taskid) => apiClient.get(`/api/progress/${taskid}`),
}

export default apiClient