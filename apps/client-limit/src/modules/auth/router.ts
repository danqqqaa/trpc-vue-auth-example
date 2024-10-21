import LoginPage from './pages/AuthPage.vue'
import HomePage from "../../views/HomeView.vue"

export const router = [
    {
        path: '/auth',
        component: LoginPage
    },
    {
        path: '/home',
        component: HomePage
    }
]