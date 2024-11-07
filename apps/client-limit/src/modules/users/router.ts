import UserPage from "./pages/UsersPage.vue"

export const router = [
    {
        path: '/users',
        component: UserPage,
        name: 'Пользователи',
        onLayout: true

    }
]