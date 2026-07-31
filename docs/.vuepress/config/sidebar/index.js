// .vuepress/config/sidebar/index.js
import javaBase from './java-base.js'
import springBoot from './springboot.js'
import servlet from './servlet.js'
import fileUpload from './file-upload.js'
import tomcat from './tomcat.js'
import jdbc from './jdbc.js'
import webHttp from './web-http.js'
import javaIO from './java-io.js'
import javaJvm from './java-jvm.js'
import javaConcurrency from './java-concurrency.js'
import javaNewFeatures from './java-new-features.js'
import javaCollections from './java-collections.js'
import toolsIde from './tools-ide.js'
import rocketmq from './rocketmq.js'
import databaseMysql from './database-mysql.js'

const sidebar = {
  '/java/java-base/': javaBase,
  '/java/io/': javaIO,
  '/java/jvm/': javaJvm,
  '/java/concurrency/': javaConcurrency,
  '/java/new-features/': javaNewFeatures,
  '/java/collections/': javaCollections,
  '/spring/springboot/':springBoot,
  '/web/servlet/':servlet,
  '/web/file-upload/':fileUpload,
  '/web/tomcat/':tomcat,
  '/web/jdbc/':jdbc,
  '/web/http/':webHttp,
  '/tools/ide/':toolsIde,
  '/middleware/rocketmq/':rocketmq,
  '/database/mysql/':databaseMysql,
}

export default sidebar