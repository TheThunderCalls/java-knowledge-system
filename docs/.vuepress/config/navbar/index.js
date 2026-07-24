// .vuepress/config/navbar/index.js
import java from './java.js'
import web from './web.js'
import spring from './spring.js'
import tools from './tools.js'
import middleware from './middleware.js'

const navbar = [
  '/',
  java,
  web,
  spring,
  middleware,
  tools,
  { text: 'GitHub', link: 'https://github.com/thethundercalls' }
]

export default navbar