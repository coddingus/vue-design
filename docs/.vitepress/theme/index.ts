import './styles/index.css'
import { h, App } from 'vue'
import { VPTheme } from './vue'

export default Object.assign({}, VPTheme, {
  ...VPTheme,
  Layout: () => {
    // @ts-ignore
    return h(VPTheme.Layout, null, {
    })
  }
})
