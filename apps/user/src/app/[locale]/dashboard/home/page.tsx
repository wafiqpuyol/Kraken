import { useRedirectToLogin } from "../../../../hooks/useRedirect"

const Home = async ({ params: { locale } }: { params: { locale: string } }) => {
    await useRedirectToLogin(locale, "/login")
    return (
        <div>Home</div>
    )
}

export default Home