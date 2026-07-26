---
title: 参数校验
---
# 参数校验

::: important 说明
参数校验是 **“防御性编程的第一道防线”**。
很多项目把校验逻辑写在 Controller 或 Service 中，导致代码臃肿、复用性差、规则分散。
Spring Boot 参数校验基于 Jakarta Validation 规范，通过 `@Validated` 触发校验，校验失败抛出 `MethodArgumentNotValidException`，配合全局异常处理器可实现统一返回；分组校验解决多场景复用问题，自定义校验器用于处理复杂业务规则，是构建企业级 API 的必备能力。
本文以 **Spring Boot 3.x + Jakarta Validation** 为基础，系统性讲解 **参数校验的标准姿势、全局异常处理、自定义校验器以及常见坑点**。
:::


## 为什么需要参数校验？

先看一段“反面教材”：

```java
@PostMapping("/user")
public Result<?> createUser(UserVO vo) {
    if (vo.getUsername() == null || vo.getUsername().isEmpty()) {
        return Result.fail(400, "用户名不能为空");
    }
    if (vo.getPassword() == null || vo.getPassword().length() < 6) {
        return Result.fail(400, "密码长度不能小于6位");
    }
    // 更多 if...
    return Result.success();
}
```

**问题显而易见：**

- 校验逻辑与业务代码混杂
- 代码重复（新增接口又要写一遍）
- 可读性差
- 规则难以维护

 **参数校验的目标：**

> 把“数据是否合法”的判断，从业务代码中剥离出去。



## Jakarta Validation

> 核心规范：JSR‑380（Bean Validation 3.0）
>
> Spring Boot 2.3+ 之后，默认使用 **Jakarta Validation（原 Bean Validation）**。

### 核心依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

> Spring Boot 2.3 之后需要显式引入。



### 常用校验注解

| 注解                      | 作用                          |
| ------------------------- | ----------------------------- |
| `@NotNull`                | 不能为 null                   |
| `@NotBlank`               | 不能为空字符串（字符串专用）  |
| `@NotEmpty`               | 不能为空（集合 / 数组 / Map） |
| `@Size(min, max)`         | 长度 / 大小范围               |
| `@Min` / `@Max`           | 数值范围                      |
| `@Email`                  | 邮箱格式                      |
| `@Pattern`                | 正则匹配                      |
| `@Positive` / `@Negative` | 正数 / 负数                   |



### 基础用法

在 VO 类上定义校验规则

```java
@Data
public class UserVO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 20, message = "用户名长度必须在3-20之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20之间")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    @NotNull(message = "年龄不能为空")
    @Min(value = 18, message = "年龄必须大于等于18")
    private Integer age;
}
```

在 Controller 中开启校验

```java
@PostMapping("/user")
public Result<?> createUser(@RequestBody @Validated UserVO vo) {
    return Result.success(vo);
}
```

**关键点**

- `@Validated`：Spring 的校验注解（推荐，支持分组）
- `@Valid`：JSR‑380 标准注解
- 两者在简单场景下可互换



校验失败后的默认行为：

​	当校验失败时，Spring 会抛出：`MethodArgumentNotValidException`，默认返回一个 **400 Bad Request + 一大堆看不懂的 JSON**。



### 全局异常处理

在全局异常处理器中拦截校验失败后的异常：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<?> handleValidationException(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();
        return Result.fail(400, message);
    }
}
```

**前端收到的响应**

```json
{
  "code": 400,
  "message": "用户名不能为空",
  "data": null,
  "timestamp": 1700000000000
}
```

### Query 参数校验

```java
@GetMapping("/user")
public Result<?> getUser(
        @RequestParam @NotBlank(message = "用户名不能为空") String username,
        @RequestParam @Min(value = 1, message = "页码必须大于0") int pageNum) {
    return Result.success();
}
```

**注意**

- 需要在 Controller 类上加 `@Validated`
- 否则校验不生效

```java
@Validated
@RestController
@RequestMapping("/users")
public class UserController { }
```



### Path 参数校验

```java
@GetMapping("/{id}")
public Result<?> getUserById(@PathVariable @Min(1) Long id) {
    return Result.success();
}
```



### Header 参数校验

```java
@GetMapping("/header")
public Result<?> getHeader(
        @RequestHeader @NotBlank(message = "Token不能为空") String token) {
    return Result.success();
}
```



## 分组校验

同一个 VO，在 **新增** 和 **修改** 场景下的校验规则往往不同。

1] 定义分组接口

```java
public interface CreateGroup { }
public interface UpdateGroup { }
```



2] 在 VO 中指定分组

```java
@Data
public class UserVO {

    @NotNull(groups = UpdateGroup.class, message = "ID不能为空")
    private Long id;

    @NotBlank(groups = {CreateGroup.class, UpdateGroup.class},
              message = "用户名不能为空")
    private String username;

    @NotBlank(groups = CreateGroup.class, message = "密码不能为空")
    private String password;
}
```



3] Controller 中指定分组

```java
@PostMapping("/user")
public Result<?> createUser(@RequestBody @Validated(CreateGroup.class) UserVO vo) {
    return Result.success();
}

@PutMapping("/user")
public Result<?> updateUser(@RequestBody @Validated(UpdateGroup.class) UserVO vo) {
    return Result.success();
}
```



## 自定义校验器

当内置注解无法满足需求时，我们需要自定义校验逻辑。

例如：校验手机号格式

1] 定义校验注解

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {

    String message() default "手机号格式不正确";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```



2] 实现校验逻辑

```java
public class PhoneValidator implements ConstraintValidator<Phone, String> {

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^1[3-9]\\d{9}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // 允许为空，由 @NotNull 控制
        }
        return PHONE_PATTERN.matcher(value).matches();
    }
}
```



3] 使用自定义注解

```java
@Data
public class UserVO {
    @Phone
    private String phone;
}
```



## 常见错误

### 忘记在 Controller 类上加 `@Validated`

**现象**：Query / Path 参数校验不生效

**解决**：Controller 类上加 `@Validated`



### @NotNull vs @NotBlank 混淆

| 注解        | 适用类型                 | 说明                           |
| ----------- | ------------------------ | ------------------------------ |
| `@NotNull`  | 任意                     | 不能为 null                    |
| `@NotBlank` | String                   | 不能为 null + 不能是空白字符串 |
| `@NotEmpty` | Collection / Map / Array | 不能为 null + size > 0         |



### 校验异常直接抛给前端

**现象**：前端收到 400 + 一大堆异常信息

**解决**：全局异常处理器拦截 `MethodArgumentNotValidException`



### 校验逻辑写在 Service 中

**现象**：Controller 层薄，Service 层臃肿

**解决**：校验前移到 Controller（或 AOP）



## 生产环境最佳实践

1. **VO 与 DTO 分离**
   - 入参：XXXVO / XXXDTO
   - 出参：XXXVO
2. **合理使用分组校验**
   - 新增 / 修改 / 查询使用不同分组
3. **自定义校验器复用**
   - 手机号、身份证、枚举值等
4. **敏感字段脱敏**
   - 结合日志体系，避免打印敏感信息



## 总结

> Spring Boot 参数校验的本质，是将 **“数据合法性判断”** 从业务代码中剥离，交由 **Jakarta Validation** 统一处理。
>
> 通过 `@Validated` + 全局异常处理 + 分组校验 + 自定义校验器，我们可以构建出一套 **健壮、可维护、可扩展** 的参数校验体系。

