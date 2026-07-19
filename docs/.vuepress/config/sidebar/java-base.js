export default [
  {
    // text: 'Jva基础',
    collapsible: false, //不可折叠
    prefix: '/java/java-base/',
    children: [
        '/java/java-base/',
        {
            text: '基础语法', 
            collapsible: true, //不可折叠
            children: [
                'syntax/data-type',
                'syntax/flow-control',
            ]
        
        },
        {
            text: '面向对象', 
            collapsible: true, //不可折叠
            children: [
                'oop/class-object',
                'oop/polymorphism',
                'oop/object',
            ]
        
        },
    ],
  },
]