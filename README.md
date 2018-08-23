# vue-stat
[![Build Status](https://travis-ci.org/wjtools/vue-stat.svg?branch=master)](https://travis-ci.org/wjtools/vue-stat)
> vuejs 统计埋点插件，目前可适用于友盟和百度统计

## 安装

```shell
npm install vue-stat --save
```

在页面中引用
```javascript
import stat from 'vue-stat'
```

使用插件
```javascript
Vue.use(stat,'YOUR_SITEID')
```

通过 options 参数进行更多设置
```javascript
Vue.use(stat, options)
```

**options**

| 参数 | 必输 | 默认 | 说明 | 备注 |
|-----|------|-----|-----|------|
| siteId | 是 | | 绑定要接受 API 请求的统计代码 siteid| |
| site | 否 | | 指定统计脚本的链接地址| |
| debug | 否 | false | 调试模式下将在控制台中输出调用接口时传递的参数 | **请不要在生产环境中使用，避免造成安全隐患** |
| autoPageview | 否 | true | 是否开启自动统计 PV | |
| src | 否 | https://hm.baidu.com/hm.js?SITEID | 指定统计脚本标签的 src 属性 | **设置此项，则 siteId 和 site 设置无效** |

## API

查看官方文档：[百度统计](http://tongji.baidu.com/open/api/more)；[友盟](http://open.cnzz.com/a/new/procedure/)

**注意:** 所有 this 均为 Vue 实例

### trackPageview

用于发送某个 URL 的 PV 统计请求，适用于统计 AJAX、异步加载页面，友情链接，下载链接的流量。

**用法**
```javascript
this.$stat.trackPageview(path[, fromPath])
```

**参数**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| path | 是 | string | 指定 PV 页面的 URL 地址，必须是以"/"开头的相对路径 |
| fromPath | 否 | string | 自定义来源页 URL 地址，建议填写该异步加载页面的母页面。**！！！仅友盟支持** |

### trackEvent

用于发送页面上按钮等交互元素被触发时的事件统计请求。如视频的“播放、暂停、调整音量”，页面上的“返回顶部”、“赞”、“收藏”等。也可用于发送 Flash 事件统计请求。

**用法**
```javascript
this.$stat.trackEvent(category, action[, label, value, nodeid])
```

**参数**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| category | 是 | string | 表示事件发生在谁身上，如“视频”、“小说”、“轮显层”等等。 |
| action | 是 | string | 表示访客跟元素交互的行为动作，如"播放"、"收藏"、"翻层"等等。|
| label | 否 | string | 用于更详细的描述事件，如具体是哪个视频，哪部小说。|
| value | 否 | int | 用于填写打分型事件的分值，加载时间型事件的时长，订单型事件的价格。**详情见官方文档** |
| nodeid | 否 | string | 填写事件元素的 div 元素 id。请填写 class id，暂不支持 name。**！！！仅友盟支持** |

### setCustomVar

用于发送为访客打自定义标记的请求，用来统计会员访客、登录访客、不同来源访客的浏览数据。

**用法**
```javascript
this.$stat.setCustomVar(name, value[, time])
```

**参数-友盟**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| name | 是 | string | 自定义访客种类，用来描述观察访客的角度，如“会员级别”、“访客来源”等等。 |
| value | 是 | string | 自定义访客值，表示对访客类型的具体描述，如"VIP1"、"VIP2"等等。|
| time | 否 | int | 有效时长，表示本自定义访客标记的生效时长。 不填或1-表示长期有效；0-表示仅在发包页面有效；2-表示仅在本访次有效。填具体数值，表示生效时长，单位“秒”。|

**参数-百度统计**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| index | 是 | int | 自定义变量所占用的位置，索引的范围是从 1 到 5 |
| name | 是 | string | 自定义访客种类，用来描述观察访客的角度，如“会员级别”、“访客来源”等等。 |
| value | 是 | string | 自定义访客值，表示对访客类型的具体描述，如"VIP1"、"VIP2"等等。|
| scope | 否 | int | 自定义变量的作用范围：1为访客级别（对该访客始终有效）2为访次级别（在当前访次内生效）3为页面级别（仅在当前页面生效）默认为3。|


### setAccount

当您的页面上添加了多个CNZZ统计代码时，需要用到本方法绑定需要哪个 siteid 对应的统计代码来接受 API 发送的请求。未绑定的 siteid 将忽略相关请求。

**备注：** 一般情况下无需调用该方法，只需调用 Vue.use 时直接传递 siteId 或通过 options.siteId 传递即可

**用法**
```javascript
this.$stat.setAccount(siteid)
```

**参数**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| siteid | 是 | int | 绑定要接受API请求的统计代码 siteid。 |

### setAutoPageview

如果您使用 _trackPageview 改写了已有页面的 URL，那么建议您在统计代码执行前先调用 _setAutoPageview，将该页面的自动PV统计关闭，防止页面的流量被统计双倍。

**备注：** 在调用 Vue.use 时可通过 options.autoPageview 设置初始值，默认为 true

**用法**
```javascript
this.$stat.setAutoPageview(autopageview)
```

**参数**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| autopageview | 是 | boolean | 是否自动发送页面 PV 的统计请求，默认为true。 |

### deleteCustomVar

发送删除自定义访客标签的请求。将访客身上已被标记的自定义访客类型去掉，去掉后不再继续统计。**！！！此方法仅友盟支持**

**用法**
```javascript
his.$stat.deleteCustomVar(name)
```

**参数**

| 参数 | 必输 | 类型 | 说明 |
|-----|------|-----|-----|
| name | 是 | string | 需要被删除的自定义访客类型。填写自定义访客类型种类名 name。 |

### ready

当需要严格控制加载时序时，可使用 ready 方法。该方法返回一个 promise，当外部统计脚本加载完毕，全局 _czc/_hmt 对象存在时，promise 被 resolve。

**用法**
```javascript
this.$stat.ready().then(() => {
  ...
}).catch(() => {
  ... // error handling here
})

// 使用 async await, 建议使用 try/catch 避免加载失败影响主程序
async SOME_METHOD () {
  try {
    await this.$stat.ready()
    ...
  } catch (e){
    ... // error handling here
  }
}
```

## 指令

vue-stat 提供 stat-event，stat-pageview 和 auto-pageview 三个指令，开发者可以直接在 html 模版中使用来统计网站数据

### stat-event

使用指令 v-stat-event 监听事件， 通过 modifiers 指定事件类型，将自动为绑定元素添加事件监听，当事件触发调用统计代码。 如不指定事件，默认监听 click 事件。

可通过逗号分隔的字符串或对象字面量传递参数，以字符串传递时请注意参数顺序，可参考 trackEvent API。

**用法**
```html
<button v-stat-event="'category, action'"></button> // 统计 click 事件简写

<button v-stat-event.click="'category, action''"></button> // 统计 click 事件

<input v-stat-event.keypress="'category, action'"> // 统计keypress事件

<button v-stat-event="'category, action, label, value, nodeid'"></button> // 以字符串传递参数

<button v-stat-event="{category: 'category', action: 'action'}"></button> // 以对象字面量传递参数
```

### stat-pageview

使用指令 stat-pageview 统计虚拟 PV ，一般可以配合 v-show 或 v-if 来统计局部动态视图的 PV。

可通过逗号分隔的字符串或对象字面量传递参数，以字符串传递时请注意参数顺序，可参考 trackPageview API。

**用法**
```html
<div v-show="show" v-stat-pageview="'/bar'">bar</div> //  跟踪 v-show 绑定元素的虚拟 pv

<div v-if="show" v-stat-pageview="'/foo'">foo</div> // 跟踪 v-if 绑定元素的虚拟pv

<div v-stat-pageview="'/tar, https://github.com/'"></div> // 以字符串指定受访页面和来源

<div v-stat-pageview="{path: '/zoo', fromPath: 'https://github.com/'}"></div> // 以对象字面量指定受访页面和来源
```

### auto-pageview

使用指令 auto-pageview 开关自动统计

**用法**
``` html
<div v-auto-pageview=true></div> // 启用 auto-pageview

<div v-auto-pageview=false></div> // 停止 auto-pageview
```

## 默认参数和改变参数顺序

认情况下，vue-stat 并不提供默认参数和参数顺序的设置，但开发者可以根据需求，使用装饰器模式，来提供默认参数和改变参数顺序。

例如：我们想在监听事件时默认 category，只需要传递 action，则代码如下

```javascript
let trackEvent = stat.trackEvent
stat.trackEvent = (action, category = 'default') => {
  trackEvent.call(stat, category, action)
}

Vue.use(stat,'YOUR_SITEID')
```

## 参考项目

[vue-uweb](https://github.com/raychenfj/vue-uweb)

[vue-ba](https://github.com/minlingchao1/vue-ba)
