import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
})

// Refreshes expired access tokens and retries the original request.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
        ) {
            const requestUrl = originalRequest.url || ''

            // Handles protected admin requests.
            const isAdminRequest =
                requestUrl.startsWith('/admin/') &&
                !requestUrl.includes('/admin/login') &&
                !requestUrl.includes('/admin/refresh') &&
                !requestUrl.includes('/admin/logout')

            // Handles protected user requests.
            const isUserRequest =
                requestUrl.startsWith('/user/') ||
                requestUrl.startsWith('/auth/profile') ||
                requestUrl.startsWith('/auth/change-password') ||
                requestUrl.startsWith('/auth/change-email/')

            if (isAdminRequest || isUserRequest) 
            {
                originalRequest._retry = true

                try {
                    const refreshEndpoint = isAdminRequest
                        ? '/admin/refresh'
                        : '/auth/refresh'

                    await api.post(refreshEndpoint)

                    return api(originalRequest)
                } catch (refreshError) {
                    return Promise.reject(refreshError)
                }
            }
        }

        return Promise.reject(error)
    }
)
export default api