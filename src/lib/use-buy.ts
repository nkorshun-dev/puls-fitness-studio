import { useNavigate } from 'react-router-dom'
import { useAccount } from '../context/account-context'
import { useToast } from '../context/toast-context'

/** Оформление абонемента: без входа отправляем в кабинет. */
export function useBuy() {
  const { state, buy } = useAccount()
  const toast = useToast()
  const navigate = useNavigate()
  return (planId: string) => {
    if (!state.user) {
      toast.push('Сначала войдите в демо-кабинет, затем оформите абонемент.', 'info')
      navigate('/account')
      return
    }
    if (buy(planId).ok) navigate('/account')
  }
}
