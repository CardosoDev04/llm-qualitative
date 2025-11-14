import { useNavigate } from "react-router"

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full gap-8 items-center justify-center">
      <div onClick={() => {
        navigate('/dashboard/responses')
      }} className="cursor-pointer hover:scale-[101%] transition-all">Responses</div>
      <div onClick={() => {
        navigate('/dashboard/questions')
      }} className="cursor-pointer hover:scale-[101%] transition-all">Questions</div>
      <div onClick={() => {
        navigate('/dashboard/descriptive-codes')
      }} className="cursor-pointer hover:scale-[101%] transition-all">Descriptive Codes</div>
      <div onClick={() => {
        navigate('/dashboard/participants')
      }} className="cursor-pointer hover:scale-[101%] transition-all">Participants</div>
    </div>
  )
}
