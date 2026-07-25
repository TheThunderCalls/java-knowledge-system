---
title: IDEA 
---
# Idea

> idea 2025

## 快捷键

| 快捷键   | 作用               |
| -------- | ------------------ |
| Ctrl + H | 查看当前类的继承类 |



## Maven

### 设置自动导入maven依赖

> 方案一： 首次在pom文件中添加依赖时，IDEA右下角会弹框提示是否开启自动导入，点击开启即可
>
> 方案二： 手动设置，File → Settings → Build, Execution, Deployment → Build Tools → Sync project after changes in the build scripts → 勾选Any changes → OK
>
> 方案三： 全局手动设置，File → New Projects Setup → Settings for New Projects → Build, Execution, Deployment → Build Tools → Sync project after changes in the build scripts → 勾选Any changes → OK







## Spring Boot

### 配置Spring Boot 热部署

添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```

IDEA 自动编译：

​	1. Settings → Build, Execution, Deployment → Compiler → 勾 **Build project automatically**

​	2. Settings → Advanced Settings → Compiler 分组勾 **Allow auto-make to start even if developed application is currently running**

验证是否真生效

1. 正常启动，控制台出现 `DevTools` 相关日志
2. 改一个 `@GetMapping` 的返回字符串，`Ctrl+S`
3. 观察 IDEA 自动编译 → 控制台打印 `Restarting due to file change...`
4. 浏览器刷新（装 LiveReload 插件可自动刷）拿到新内容 

