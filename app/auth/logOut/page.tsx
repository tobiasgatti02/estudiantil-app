import { doLogout } from "@/app/lib/userActions"

const Logout = () => {
  return (
    <form action={doLogout}>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded" type="submit">
            Logout
        </button>
    </form>
  )
}

export default Logout