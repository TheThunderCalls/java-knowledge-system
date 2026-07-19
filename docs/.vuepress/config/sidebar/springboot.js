export default [
  {
    collapsible: false, //不可折叠
    prefix: '/web/springboot/',
    children: [
        '/web/springboot/',
        {
            text: 'API接口', 
            collapsible: true, //可折叠
            children: [
                'springmvc/request-response.md',
            ]
        },
    ],
  },
]