export default [
  {
    collapsible: false, //不可折叠
    prefix: '/spring/springboot/',
    children: [
        '/spring/springboot/',
        {
            text: '基础入门',
            collapsible: true,
            children:[
                
            ]
        },
        {
            text: 'Web 开发', 
            collapsible: true, //可折叠
            children: [
                'web/request-param-binding.md',
            ]
        },
        {
            text: '数据访问', 
            collapsible: true, //可折叠
            children: [
                
            ]
        },
        {
            text: '原理', 
            collapsible: true, //可折叠
            children: [
                
            ]
        },
    ],
  },
]