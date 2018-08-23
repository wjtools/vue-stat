import stat from '../index'
import { notChanged } from './utils'

export default function (el, binding) {
  if (notChanged(binding)) return

  const args = []
  if (binding.value === false || binding.value === 'false') args.push(false)
  else args.push(true)
  stat.setAutoPageview(...args)
}

