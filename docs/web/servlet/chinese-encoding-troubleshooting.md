---
title: 中文乱码
---
# 中文乱码全解析

::: important 说明
 中文乱码是 Java Web 开发中最经典、也最容易被“表面解决”的问题。

 很多开发者只知道“加个 UTF‑8 就好了”，却不了解乱码究竟发生在哪一层。

 本文将从 **Servlet 规范** 出发，沿 HTTP → Tomcat → Spring MVC → Spring Boot 的路径，系统性拆解中文乱码的产生原因、解决方式与底层原理。
:::

> 中文乱码的本质是编码与解码不一致；Servlet 时代由 `request.setCharacterEncoding()` 控制请求体解码，Tomcat 8.5+ URI 默认 UTF‑8，Spring 通过 `CharacterEncodingFilter` 在容器解析前强制编码，Spring Boot 进一步通过自动配置和 `server.servlet.encoding` 实现全链路 UTF‑8 统一。



## 什么是“乱码”？从字符集说起

### 字符 vs 字节

- **字符（Char）**：人类可读的符号（`中`、`A`、`😀`）
- **字节（Byte）**：计算机存储的最小单位

**编码（Encode）**：字符 → 字节

**解码（Decode）**：字节 → 字符

**乱码的本质只有一句话：**

> **编码和解码使用的字符集不一致。**



### 常见字符集

| 字符集     | 说明                                  |
| ---------- | ------------------------------------- |
| ASCII      | 英文字符（1 字节）                    |
| ISO‑8859‑1 | 西欧字符（1 字节，Tomcat 老版本默认） |
| GBK        | 中文（2 字节，Windows 默认）          |
| **UTF‑8**  | Unicode（变长，1–4 字节，互联网标准） |



## Servlet 时代：乱码的源头

### HTTP 请求中的字符

一个 HTTP 请求包含两部分可能携带中文：

1. **URI / QueryString**
2. **Request Body**



### URI / QueryString 的解码（Tomcat 行为）

浏览器发送：

```
GET /test?name=张三
```

浏览器会先进行 **Percent Encoding**：

```
%E5%BC%A0%E4%B8%89
```

Tomcat 接收到后，需要将其解码为字符串。

#### 关键点

- Tomcat 使用 `org.apache.catalina.connector.Request` 进行解码
- **Tomcat 8.5+ 默认使用 UTF‑8**
- **Tomcat 8.0 及更早版本默认使用 ISO‑8859‑1**

```java
// Tomcat 源码简化逻辑
String decoded = URLDecoder.decode(encoded, "ISO-8859-1"); // 老版本
```

**这就是为什么老项目经常出现 QueryString 乱码**



### Request Body 的解码（Servlet 规范）

对于 POST 请求（`application/x-www-form-urlencoded`）：

```java
request.getParameter("name");
```

Servlet 容器在**第一次调用 `getParameter()` 时**，才会真正解析请求体。

#### 默认行为

- 未指定编码 → **ISO‑8859‑1**
- 编码一旦确定，**不可更改**

```java
// 错误示例：顺序反了
request.getParameter("name"); // 已经用 ISO-8859-1 解码
request.setCharacterEncoding("UTF-8"); // 无效！
```

**正确顺序**

```java
request.setCharacterEncoding("UTF-8");
request.getParameter("name");
```



### Response 输出乱码

```java
response.getWriter().write("中文");
```

默认情况下：

- `HttpServletResponse` 使用 **ISO‑8859‑1**
- 浏览器用 UTF‑8 解析 → 乱码

**解决方案**

```java
response.setContentType("text/html;charset=UTF-8");
response.setCharacterEncoding("UTF-8");
```

**必须在 `getWriter()` 之前调用**



## Spring MVC 时代的改进与坑

### CharacterEncodingFilter

Spring 提供了 `CharacterEncodingFilter`，它的作用是：

> **在 Servlet 读取请求体之前，强制设置编码为 UTF‑8。**

```java
public class CharacterEncodingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws IOException, ServletException {

        request.setCharacterEncoding(this.encoding);
        response.setCharacterEncoding(this.encoding);

        filterChain.doFilter(request, response);
    }
}
```

**关键点**

- `OncePerRequestFilter`：确保只执行一次
- **必须在所有参数解析 Filter 之前执行**



### Spring Boot 的自动配置

Spring Boot 2.2+ 自动注册了该 Filter：

```java
@Bean
@ConditionalOnMissingBean
public FilterRegistrationBean<CharacterEncodingFilter> characterEncodingFilter() {
    FilterRegistrationBean<CharacterEncodingFilter> bean =
            new FilterRegistrationBean<>(new CharacterEncodingFilter());
    bean.addInitParameter("encoding", "UTF-8");
    bean.addInitParameter("forceEncoding", "true");
    bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return bean;
}
```

**这就是为什么 Spring Boot 2.2+ 很少看到乱码**



### @RequestBody 与 JSON（Jackson）

`@RequestBody` 不走 `getParameter()`，而是由 **HttpMessageConverter** 处理。

```java
@PostMapping("/json")
public void json(@RequestBody User user) {}
```

Jackson 默认：

- 使用 `UTF‑8` 解码
- 但如果 HTTP Header 中没有 `charset`，可能回退到平台默认编码

**最佳实践（前端）**

```
Content-Type: application/json;charset=UTF-8
```



## Spring Boot 时代的“终极解法”

### 配置文件

```properties
server.servlet.encoding.enabled=true
server.servlet.encoding.charset=UTF-8
server.servlet.encoding.force=true
server.tomcat.uri-encoding=UTF-8
```



### 为什么还需要这些配置？

| 配置项                       | 作用                         |
| ---------------------------- | ---------------------------- |
| `server.servlet.encoding.*`  | 强制 Request / Response 编码 |
| `server.tomcat.uri-encoding` | URI / QueryString 解码       |
| `force=true`                 | 覆盖客户端指定编码           |



## 常见乱码场景与排查流程

### QueryString 乱码

**排查**

- Tomcat 版本 < 8.5？
- `server.tomcat.uri-encoding` 是否 UTF‑8？



### POST 表单乱码

**排查**

- `CharacterEncodingFilter` 是否生效？
- Filter 顺序是否最高？
- 是否在 `getParameter()` 之后才设置编码？



### JSON 请求乱码

**排查**

- HTTP Header 是否指定 `charset=UTF-8`？
- Jackson 配置是否被覆盖？



### 排查流程图

```text
请求乱码
   ↓
URI / QueryString？
   ├─ 是 → Tomcat URI 编码
   └─ 否 → POST Body？
           ├─ 表单 → CharacterEncodingFilter
           └─ JSON → HttpMessageConverter + Header
```



## 生产环境最佳实践

1. **Spring Boot ≥ 2.2**

2. **前端所有请求明确指定 `charset=UTF-8`**

3. **数据库连接串指定 UTF‑8**

   ```
   useUnicode=true&characterEncoding=UTF-8
   ```

4. **日志框架使用 UTF‑8**

5. **统一全链路编码**



## 总结：乱码的本质

> 中文乱码从来不是“Spring Boot 的问题”，而是 **HTTP / Servlet / 容器 / JVM 多层编码不一致的结果**。
>
> 从 Servlet 时代的 `setCharacterEncoding()`，到 Spring 的 `CharacterEncodingFilter`，再到 Spring Boot 的自动配置，本质都是在做一件事：
>
> **确保“编码 = 解码 = UTF‑8”在全链路中一致。**

