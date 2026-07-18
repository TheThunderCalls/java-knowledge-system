export default [
  {
    // text: 'Jva基础',
    collapsible: false, //不可折叠
    children: [
        {
            text: '知识点',
            link: '/java/java-base/'
        },
        {
            text: '基础语法', 
            collapsible: true, //不可折叠
            children: [
                {
                    text: '数据类型',
                    link: '/java/java-base/syntax/data-type'
                },
                {
                    text: '流程控制',
                    link: '/java/java-base/syntax/flow-control'
                },
            ]
        
        },
        {
            text: '面向对象', 
            collapsible: true, //不可折叠
            children: [
                '/java/java-base/oop/class-object',
                {
                    text: '封装 / 继承 / 多态',
                    link: '/java/java-base/oop/polymorphism'
                },
                {
                    text: 'Object 类',
                    link: '/java/java-base/oop/object'
                },
            ]
        
        },
    ],
  },
]