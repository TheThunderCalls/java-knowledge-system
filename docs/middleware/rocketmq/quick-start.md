---
title: 快速入门
---
# 快速入门

::: important 说明
目标：在本地搭建 RocketMQ 最小运行环境，并通过 Java 代码完成消息的发送与消费，跑通“第一个消息闭环”。
:::


## 背景：为什么从“跑通”开始？

在学习 RocketMQ 时，经常会陷入两个极端：

- 一上来就读源码、看架构图，结果“懂了概念，写不出代码”
- 或者只停留在 `mqadmin` 命令，不了解 Java 客户端如何工作

**正确的学习路径应该是：**

> 先跑通 → 再理解 → 后优化 → 最终掌控

本文就是这条路径的第一步。



## 环境准备

### 本地环境要求

| 组件     | 版本                     |
| -------- | ------------------------ |
| OS       | macOS / Linux / Windows  |
| JDK      | 8+                       |
| Maven    | 3.6+                     |
| RocketMQ | 5.x（本文以 5.2.0 为例） |



### 下载并启动

#### 二进制

1] 下载

::: details 下载二进制包
```sh
wget https://dist.apache.org/repos/dist/release/rocketmq/5.2.0/rocketmq-all-5.2.0-bin-release.zip
unzip rocketmq-all-5.2.0-bin-release.zip
cd rocketmq-all-5.2.0-bin-release
```
:::

2] 启动 NameServer


```sh
nohup sh bin/mqnamesrv &
tail -f ~/logs/rocketmqlogs/namesrv.log
```

看到如下日志说明启动成功：

```text
The Name Server boot success...
```

3] 启动 Broker

```sh
nohup sh bin/mqbroker -n localhost:9876 --enable-proxy &
tail -f ~/logs/rocketmqlogs/broker.log
```

看到如下日志说明启动成功：

```text
The broker[broker-a, 192.168.x.x:10911] boot success...
```

**关键点**

- NameServer 端口：`9876`
- Broker 默认端口：`10911`
- 必须先启动 NameServer，再启动 Broker



#### Docker

1] centos yum源配置

::: details 配置阿里云yum镜像源
```sh
cd /etc/yum.repos.d/

mkdir backup
mv /etc/yum.repos.d/* /etc/yum.repos.d/backup/
# 下载aliyun 的yum源配置
curl -o /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo

yum clean all
yum makecache
```
:::

2] 安装 Docker 和 Docker Compose

::: details 安装 Docker 和 Docker Compose
```sh
# 1) 卸载旧版（新机器可跳过）
sudo yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 2) 装依赖
sudo yum install -y yum-utils

# 3) 用阿里云镜像源（比官方快）
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

# 4) 安装 Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 5) 启动并开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 6) 验证
docker --version
docker compose version   # 注意：新版是 docker compose（无横线）

# 7) 配置国内镜像加速
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "registry-mirrors": ["https://docker.m.daocloud.io"]
}
EOF
sudo systemctl restart docker
```
:::


3] 安装 RocketMQ

```sh
mkdir -p /usr/local/rocketmq/{namesrv/logs,broker/logs,broker/store,broker/conf}
cd /usr/local/rocketmq
```

::: details broker.conf
```sh
cat > broker/conf/broker.conf <<'EOF'
brokerClusterName=DefaultCluster
brokerName=broker-a
brokerId=0
namesrvAddr=rmqnamesrv:9876
brokerIP1=192.168.229.130
listenPort=10911
deleteWhen=04
fileReservedTime=48
brokerRole=ASYNC_MASTER
flushDiskType=ASYNC_FLUSH
autoCreateTopicEnable=true
autoCreateSubscriptionGroup=true

# 关键：显式指定存储路径（防止 ScheduleMessageService 拿不到默认路径）
storePathRootDir=/home/rocketmq/store
storePathCommitLog=/home/rocketmq/store/commitlog
storePathDelayQueue=/home/rocketmq/store/delayqueue
mapedFileSizeCommitLog=1073741824
mapedFileSizeConsumeQueue=300000
destroyMapedFileIntervalForcibly=120000
redeleteHangedFileInterval=120000
diskMaxUsedSpaceRatio=88
EOF
```
:::

::: details docker-compose.yml
```sh
cat > docker-compose.yml <<'EOF'
version: '3.8'

services:
  namesrv:
    image: apache/rocketmq:5.3.2
    container_name: rmqnamesrv
    ports:
      - "9876:9876"
    environment:
      JAVA_OPT_EXT: "-Xms64m -Xmx64m"
    volumes:
      - ./namesrv/logs:/home/rocketmq/logs
    command: sh mqnamesrv
    mem_limit: 200m
    networks:
      - rocketmq
    restart: unless-stopped

  broker:
    image: apache/rocketmq:5.3.2
    container_name: rmqbroker
    ports:
      - "10909:10909"
      - "10911:10911"
      - "10912:10912"
    environment:
      NAMESRV_ADDR: "rmqnamesrv:9876"
      JAVA_OPT_EXT: "-Xms128m -Xmx128m -Xmn64m"
    volumes:
      - ./broker/logs:/home/rocketmq/logs
      - ./broker/store:/home/rocketmq/store
      - ./broker/conf/broker.conf:/home/rocketmq/rocketmq-5.3.2/conf/broker.conf
    command: sh mqbroker -c /home/rocketmq/rocketmq-5.3.2/conf/broker.conf
    depends_on:
      - namesrv
    mem_limit: 400m
    networks:
      - rocketmq
    restart: unless-stopped

  dashboard:
    image: apacherocketmq/rocketmq-dashboard:1.0.0
    container_name: rmqdashboard
    ports:
      - "8082:8080"
    environment:
      JAVA_OPTS: "-Drocketmq.namesrv.addr=rmqnamesrv:9876 -Dserver.port=8080 -Xms64m -Xmx64m -Xmn32m"
    depends_on:
      - namesrv
    mem_limit: 200m
    restart: unless-stopped
    networks:
      - rocketmq

networks:
  rocketmq:
    driver: bridge
EOF
```
:::

```sh
# 修改权限
chmod -R 777 broker/store
chmod -R 777 broker/logs
chown -R 1000:1000 broker/store
chown -R 1000:1000 broker/log
```

4] 操作RocketMQ

```sh
cd /usr/local/rocketmq
# 启动
docker compose up -d

# 关闭
docker compose down

#查看状态
docker compose ps
docker stats   # 看内存占用，虚拟机小可下调 JAVA_OPT_EXT

# 关闭dashboard，内存不够任意卡顿
docker stop rmqdashboard
```



5] 验证是否真的启动

```sh
# NameServer 日志
docker logs rmqnamesrv | tail -20
```

​	看到 `The Name Server boot success` 即 OK

```sh
# Broker 注册
docker exec rmqbroker sh -c "sh mqadmin clusterList -n rmqnamesrv:9876"
```

​	能看到 `broker-a` 在线即成功

​	

注意：如果安装了dashboard，可以访问 http://192.168.229.130:8082来验证是否安装成功



## Java 客户端实战：消息收发最小闭环

### Maven 依赖

```xml
<!-- RocketMQ Client -->
<dependency>
    <groupId>org.apache.rocketmq</groupId>
    <artifactId>rocketmq-client</artifactId>
    <version>5.1.0</version>
</dependency>
```



### 生产者（Producer）

```java
public class OrderProducer {
    public static void main(String[] args) throws MQClientException, MQBrokerException, RemotingException, InterruptedException {
        // 1. 创建 Producer，指定 Producer Group（对应业务：下单系统）
        DefaultMQProducer producer = new DefaultMQProducer("order_producer_group");

        // 2. 指定 NameServer 地址（找前台问地址）
        producer.setNamesrvAddr("192.168.229.130:9876");

        // 3. 启动 Producer
        producer.start();
        System.out.println("Producer 启动成功");

        // 4. 构造消息（业务事件：OrderCreated）
        // Topic = 事件名，Tag = 事件子类型，Body = 业务数据
        Message msg = new Message(
                "order_created_topic",          // Topic：订单创建事件
                "ORDER_CREATED",               // Tag：事件类型
                "{\"orderId\":\"1001\",\"userId\":88,\"amount\":299.00}".getBytes()
        );

        // 5. 发送消息
        SendResult result = producer.send(msg);
        System.out.println("消息发送成功：" + result);

        // 6. 关闭 Producer（实际生产中常驻内存，这里为了Demo）
        producer.shutdown();
    }
}
```



### 消费者（Consumer）

```java
public class LogConsumer {
    public static void main(String[] args) throws MQClientException {
        // 1. 创建 Consumer，指定 Consumer Group（对应业务：日志系统）
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer("log_consumer_group");

        // 2. 指定 NameServer 地址
        consumer.setNamesrvAddr("192.168.229.130:9876");

        // 3. 订阅 Topic（关心订单创建事件）
        // 第二个参数：* 表示订阅所有 Tag
        consumer.subscribe("order_created_topic", "*");

        // 4. 注册监听器（处理业务逻辑）
        consumer.registerMessageListener(new MessageListenerConcurrently() {
            @Override
            public ConsumeConcurrentlyStatus consumeMessage(
                    List<MessageExt> msgs,
                    ConsumeConcurrentlyContext context) {

                for (MessageExt msg : msgs) {
                    System.out.println("日志系统收到消息：");
                    System.out.println("Topic:" + msg.getTopic());
                    System.out.println("Tag:" + msg.getTags());
                    System.out.println("Body:" + new String(msg.getBody()));
                }

                // 返回消费成功
                return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;
            }
        });

        // 5. 启动 Consumer
        consumer.start();
        System.out.println("Consumer 启动成功，等待消息...");
    }
}
```



### 启动顺序

- **启动 Docker 容器**（NameServer → Broker）
- **运行 `LogConsumer`**（先启动消费者，相当于“值班”）
- **运行 `OrderProducer`**（发送消息）
- 观察 `LogConsumer` 控制台是否打印消息

```
Consumer 启动成功，等待消息...
日志系统收到消息：
Topic:order_created_topic
Tag:ORDER_CREATED
Body:{"orderId":"1001","userId":88,"amount":299.00}
```



## 核心概念速览

| 概念       | 作用                           |
| ---------- | ------------------------------ |
| NameServer | 服务注册与发现（类似注册中心） |
| Broker     | 消息存储与投递                 |
| Producer   | 消息发送方                     |
| Consumer   | 消息消费方                     |
| Topic      | 消息主题（分类）               |
| Tag        | 消息子标签（过滤）             |
| Group      | 生产/消费集群标识              |



## 常见问题与排查

### 连接不上 NameServer

```text
RemotingConnectException: connect to <null> failed
```

检查：

- `setNamesrvAddr` 是否正确
- NameServer 是否启动
- 防火墙是否放行 9876



### Topic 不存在

```text
CODE: 17 DESC: topic does not exist
```

解决：

- 自动创建 Topic（Broker 默认开启）
- 或手动创建：

```
sh bin/mqadmin updatetopic -n localhost:9876 -t QuickStartTopic -c DefaultCluster
```



### 消费者不消费

检查：

- Topic 名称是否一致
- ConsumerGroup 是否重复
- 订阅表达式是否正确（`*` 表示订阅所有 Tag）



## 生产环境提醒

本文是 **本地开发环境**，生产环境还需关注：

- Broker 集群部署
- NameServer 高可用
- 消息持久化与刷盘策略
- 消费幂等
- 消息重试与死信队列
- 监控与告警

这些内容将在后续文章中逐步展开。



## 总结

> 本文完成了 RocketMQ 使用的“第一步”：
>
> **本地搭建 NameServer + Broker → 客户端发送消息 → 消费者接收消息**。
>
> 这一步虽然简单，却是理解 RocketMQ 架构、消息流转、客户端原理的基础。