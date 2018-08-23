import stat from '../index'
import { notChanged, isEmpty } from './utils'

export const watch = []

const trackPageview = {
  bind (el, binding) {
    const index = watch.findIndex(element => element === el)
    const isWatched = index !== -1
    // watch for a v-show binded element, push it to watch queue when v-show is false
    if (el.style.display === 'none') {
      if (!isWatched) watch.push(el)
      return
    } else {
      // remove from watch queue when v-show is true
      if (isWatched) watch.splice(index, 1)
    }
    if (!isWatched && (notChanged(binding) || isEmpty(binding))) return

    let args = []

    // passing parameters as object
    if (typeof binding.value === 'object') {
      const value = binding.value
      if (value.path) args.push(value.path)
      if (value.fromPath) args.push(value.fromPath)

      // passing parameters as string separate by comma
    } else if (typeof binding.value === 'string' && binding.value) {
      args = binding.value.split(',')
      args = args.map(arg => arg.trim())
    }

    stat.trackPageview(...args)
  },

  unbind (el, binding) {
    const index = watch.findIndex(element => element === el)
    if (index !== -1) watch.splice(index, 1)
  }
}
trackPageview.update = trackPageview.bind

export default trackPageview
