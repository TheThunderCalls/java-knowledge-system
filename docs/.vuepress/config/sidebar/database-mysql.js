export default [
  {
    collapsible: false, //不可折叠
    prefix: '/database/mysql/',
    children: [
        '/database/mysql/',
        {
            text: 'MySQL 基础', 
            collapsible: true, //可折叠
            children: [
                'base/install.md',
            ]
        },
    ],
  },
]