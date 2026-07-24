---
title: 接口响应
---
# 接口响应

::: important 说明
在 Spring Boot 开发中，Controller 的返回值往往被简化为“要么返回页面，要么返回 JSON”。
然而，在企业级应用中，接口响应远不止这两种形式。文件下载、流式输出、异步处理、响应式编程等场景，都需要使用特定的返回类型。
本文将以 **Spring Boot 3.x** 为基础，系统性梳理 **Controller 的所有返回方式**，帮助你建立完整的响应模型认知。
:::


## 背景：为什么需要了解所有返回方式？

在初学阶段，我们通常这样写代码：

```java
// 返回页面
@Controller
public class PageController {
    @GetMapping("/user")
    public String user() {
        return "user";
    }
}
```

```java
// 返回 JSON
@RestController
public class ApiController {
    @GetMapping("/api/user")
    public UserVO user() {
        return new UserVO();
    }
}
```

但在真实的生产环境中，我们会面临更多需求：

- 如何优雅地下载大文件？
- 如何实时向前端推送日志？
- 如何在高并发下提升吞吐量？
- 如何精确控制 HTTP 状态码和 Header？

要回答这些问题，就必须跳出 `@RestController` 的舒适区，全面了解 Spring MVC 提供的 **HandlerMethodReturnValueHandler** 体系。



## 核心分类：两大响应体系

在深入细节之前，我们需要先建立顶层认知。Spring MVC 的返回值可以分为两大体系：

1. **视图渲染体系（View Resolution）**
   - 返回 **逻辑视图名** 或 **视图对象**。
   - 由 `ViewResolver` 处理，最终生成 HTML。
   - 适用于传统 MVC、服务端渲染（SSR）。
2. **响应体写入体系（Message Conversion）**
   - 返回 **数据对象**。
   - 由 `HttpMessageConverter` 处理，序列化为 JSON、XML 或二进制流。
   - 适用于 RESTful API、前后端分离。



## 响应接口返回方式全集

以下是 Spring Boot 接口开发中常见的 返回方式

### POJO / @ResponseBody

**适用场景**：RESTful API，前后端分离。

**原理**：`@RestController` 包含了 `@ResponseBody`。方法返回的 POJO 会被 `HttpMessageConverter`（默认是 Jackson）序列化为 JSON。

**示例**：

```java
@GetMapping("/user")
public UserVO getUser() {
    return new UserVO(1L, "zhangsan");
}
```
### ResponseEntity

**适用场景**：需要精确控制 HTTP 状态码、Header 的接口（如文件下载、创建资源后返回 201）。

**原理**：封装了整个 HTTP 响应，包括状态码、头和体。

**示例**：

```java
@GetMapping("/custom")
public ResponseEntity<UserVO> customResponse() {
    HttpHeaders headers = new HttpHeaders();
    headers.add("X-Custom-Header", "value");
    return new ResponseEntity<>(new UserVO(), headers, HttpStatus.OK);
}
```





### Resource - 文件资源下载

**适用场景**：文件下载（Excel、PDF、图片等）。

**原理**：Spring 会自动根据 `Resource` 类型推断 Content-Type，处理 Content-Length，并支持断点续传（Range Requests）。

**示例**：

```java
@GetMapping("/download")
public Resource downloadFile() {
    return new ClassPathResource("templates/test.xlsx");
}
```



### StreamingResponseBody - 大文件流式下载

**适用场景**：超大文件下载、大数据量导出（CSV/Excel）。

**原理**：将数据写入 `OutputStream`，边写边刷，避免将整个文件加载到 JVM 内存中，防止 OOM。

**示例**：

```java
@GetMapping("/stream-download")
public StreamingResponseBody streamDownload() {
    return outputStream -> {
        // 模拟大文件写入
        for (int i = 0; i < 1_000_000; i++) {
            outputStream.write(("line " + i + "\n").getBytes(StandardCharsets.UTF_8));
        }
    };
}
```



### void - 原生响应控制

**适用场景**：需要完全控制响应输出流、WebSocket 握手前处理、SSE（Server-Sent Events）底层实现。

**原理**：Spring 不做任何后置处理，开发者直接操作 `HttpServletResponse`。

**示例**：

```java
@GetMapping("/raw")
public void rawResponse(HttpServletResponse response) throws IOException {
    response.setContentType("text/plain");
    response.getWriter().write("Hello Raw World");
}
```



### ModelAndView

**适用场景**：传统的 Spring MVC 应用，需要同时返回模型和视图名。

**原理**：显式地封装 `Model` 和 `View`。

**示例**：

```java
@GetMapping("/legacy")
public ModelAndView legacyPage() {
    ModelAndView mv = new ModelAndView("legacy-view");
    mv.addObject("message", "Hello Legacy");
    return mv;
}
```



### HttpHeaders

**适用场景**：302 重定向、CORS Preflight 响应、仅需要返回 Header 的场景。

**原理**：返回 `HttpHeaders` 对象，Spring 会将其应用到响应中。

**示例**：

```java
@GetMapping("/redirect")
public HttpHeaders redirect() {
    HttpHeaders headers = new HttpHeaders();
    headers.setLocation(URI.create("/new-location"));
    return headers;
}
```



## 全景对比表

| 返回类型                 | 体系               | 核心优势       | 典型场景              |
| ------------------------ | ------------------ | -------------- | --------------------- |
| `POJO` + `@ResponseBody` | Message Conversion | 简洁，自动化   | 普通 CRUD API         |
| `ResponseEntity<T>`      | Message Conversion | HTTP 语义完整  | 文件下载，创建资源    |
| `Resource`               | Message Conversion | 自动处理文件头 | 文件下载              |
| `StreamingResponseBody`  | Message Conversion | 防 OOM，流式   | 大文件导出            |
| `void`                   | Raw                | 绝对控制权     | 原生流操作，WebSocket |
| `ModelAndView`           | View Resolution    | 传统 MVC       | 服务端渲染页面        |
| `HttpHeaders`            | Message Conversion | 轻量，仅头     | 重定向                |



## 生产环境最佳实践

1. **REST API 首选 `ResponseEntity`**
   - 相比直接返回 POJO，`ResponseEntity` 能更好地表达 HTTP 语义（如 201 Created, 409 Conflict）。
2. **文件下载首选 `Resource`**
   - 除非需要极其复杂的流式控制，否则 `Resource` 是最优雅的方案。
3. **大文件导出首选 `StreamingResponseBody`**
   - 永远不要在内存中拼接大文件的字节数组。
4. **JSON 统一包装**
   - 对于业务 API，建议在 `ResponseEntity` 或 `@ResponseBody` 的基础上，统一使用 `Result<T>` 包装器。
