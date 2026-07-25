---
title: 统一返回结果
---
# 统一返回结果设计

::: important 说明
在 RESTful API 开发中，**“如何返回数据”** 的混乱程度，往往决定了项目的工程质量。
前端吐槽“接口格式乱”、联调效率低、异常处理不一致，大多源于**缺少统一的返回规范**。
本文系统性讲解 **统一返回结果的设计、实现与异常处理**
:::

## 为什么需要统一返回结果？

在初期开发中，我们经常看到这样的代码：

```java
@GetMapping("/user")
public User getUser() {
    return userService.getById(1L);
}
```

表面简洁，但在生产环境中会带来严重问题：

- 成功和失败的返回结构不一致
- 前端无法用一套逻辑处理所有接口
- 异常堆栈直接暴露给前端
- 缺乏业务状态码，前端难以区分“业务失败”和“系统异常”
- 不利于日志采集和监控告警

**统一返回结果的核心目的只有一个：**

> 让“成功”和“失败”拥有**相同的外壳**，让前端用一套逻辑处理所有接口。



## 核心设计：统一返回结构

### 一个合格的返回结构应该包含什么？

| 字段名      | 类型   | 是否必须 | 含义                             |
| ----------- | ------ | -------- | -------------------------------- |
| `code`      | int    | 是       | **业务状态码**（非 HTTP 状态码） |
| `message`   | String | 是       | 提示信息                         |
| `data`      | T      | 否       | 业务数据（成功时才有）           |
| `timestamp` | long   | 是       | 响应时间戳（便于排查）           |

 **为什么要有 `code`？**

- HTTP 状态码（200/500）只能表示**请求是否成功到达服务器**
- 业务状态码（20001/40001）才能表示**业务逻辑是否成功**



### 统一返回类

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Result<T> implements Serializable {

    /** 业务状态码 */
    private int code;

    /** 提示信息 */
    private String message;

    /** 业务数据 */
    private T data;

    /** 响应时间戳 */
    private long timestamp = System.currentTimeMillis();

    /**
     * 成功返回（带数据）
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data, System.currentTimeMillis());
    }

    /**
     * 成功返回（无数据）
     */
    public static <T> Result<T> success() {
        return new Result<>(200, "success", null, System.currentTimeMillis());
    }

    /**
     * 失败返回
     */
    public static <T> Result<T> fail(int code, String message) {
        return new Result<>(code, message, null, System.currentTimeMillis());
    }

    /**
     * 失败返回（兼容 Throwable）
     */
    public static <T> Result<T> fail(int code, String message, Throwable t) {
        // 生产环境不要将 t.getMessage() 直接返回给前端
        return new Result<>(code, message, null, System.currentTimeMillis());
    }
}
```

**设计亮点**

- 使用泛型 `T`，兼容任意返回类型
- 提供静态工厂方法，避免 `new`
- 包含时间戳，便于日志排查
- 区分“成功”和“失败”的语义



## 基础用法：Controller 中的正确姿势

### 成功返回

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping("/{id}")
    public Result<UserVO> getUserById(@PathVariable Long id) {
        UserVO user = userService.getById(id);
        return Result.success(user);
    }
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "zhangsan"
  },
  "timestamp": 1700000000000
}
```

### 业务失败返回

```java
@GetMapping("/biz")
public Result<?> bizError() {
    return Result.fail(4001, "用户不存在");
}
```

**响应示例**

```json
{
  "code": 4001,
  "message": "用户不存在",
  "data": null,
  "timestamp": 1700000000000
}
```



## 全局异常处理

手动 `return Result.fail()` 依然繁琐，且容易遗漏。

**生产级做法是：Controller 只关心成功逻辑，异常统一交给全局异常处理器。**

### 自定义业务异常

```java
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
```



### 全局异常处理器（@RestControllerAdvice）

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException ex) {
        return Result.fail(ex.getCode(), ex.getMessage());
    }

    /**
     * 处理参数校验异常（@Validated）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();
        return Result.fail(400, message);
    }

    /**
     * 处理系统异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception ex) {
        // 生产环境不要打印堆栈到前端
        // 日志中记录完整堆栈
        log.error("System error", ex);
        return Result.fail(500, "系统内部错误");
    }
}
```



### Controller

```java
@GetMapping("/{id}")
public Result<UserVO> getUserById(@PathVariable Long id) {
    UserVO user = userService.getById(id);
    if (user == null) {
        throw new BusinessException(4001, "用户不存在");
    }
    return Result.success(user);
}
```

> **成功走 return，失败抛异常**
>
> 异常信息统一收敛
>
> 前端始终收到统一结构



## ResponseStatusException

Spring 5.x 提供了 `ResponseStatusException`：

```java
@GetMapping("/{id}")
public UserVO getUser(@PathVariable Long id) {
    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在");
}
```

**对比**

| 方案                                        | 优点                 | 缺点               |
| ------------------------------------------- | -------------------- | ------------------ |
| `ResponseStatusException`                   | 简单，无需自定义异常 | 无法携带复杂业务码 |
| `BusinessException + @RestControllerAdvice` | 业务码灵活，结构统一 | 稍重               |

**推荐**

- 简单场景：`ResponseStatusException`
- 企业级项目：**`BusinessException` + 全局处理**



## 总结

> Spring Boot 的统一返回结果，本质上是 **“约定优于配置”** 的体现。
>
> 通过 `Result<T>` + `@RestControllerAdvice`，我们可以：
>
> - 让前端用一套逻辑处理所有接口
> - 让后端专注于业务逻辑
> - 让异常可控、日志可查、系统可观测
>
> 它是构建**工程化、可维护、可扩展**后端系统的基石。

