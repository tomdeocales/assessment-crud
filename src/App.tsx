import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import PostCreatePage from './pages/PostCreatePage'
import PostDetailPage from './pages/PostDetailPage'
import PostEditPage from './pages/PostEditPage'
import PostsPage from './pages/PostsPage'
import RegisterPage from './pages/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import LogoutPage from './pages/LogoutPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/posts" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'posts', element: <PostsPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'posts/new', element: <PostCreatePage /> },
          { path: 'posts/:id/edit', element: <PostEditPage /> },
          { path: 'logout', element: <LogoutPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
