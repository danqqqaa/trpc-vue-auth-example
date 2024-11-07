import LoginPage from './pages/AuthPage.vue'

export const router = [
    {
        path: '/auth',
        component: LoginPage,
        name: 'Авторизация',
        onLayout: false
    },
]