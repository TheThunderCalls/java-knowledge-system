import{i as e,r as t,s as n,t as r}from"./app-D5987UI9.js";var i=JSON.parse(`{"path":"/middleware/rocketmq/quick-start.html","title":"快速入门","lang":"en-US","frontmatter":{"title":"快速入门"},"git":{"contributors":[{"name":"swimming","username":"swimming","email":"2045888460@qq.com","commits":1,"url":"https://github.com/swimming"}],"changelog":[{"hash":"30798badc078f31b832d5c09812e29e2cfe22961","time":1784899514000,"email":"2045888460@qq.com","author":"swimming","message":"新增：RocketMQ 快速入门"}]},"filePathRelative":"middleware/rocketmq/quick-start.md"}`),a={name:`quick-start.md`};function o(r,i,a,o,s,c){return n(),t(`div`,null,[...i[0]||=[e(`<h1 id="快速入门" tabindex="-1"><a class="header-anchor" href="#快速入门"><span>快速入门</span></a></h1><div class="hint-container important"><p class="hint-container-title">说明</p><p>目标：在本地搭建 RocketMQ 最小运行环境，并通过 Java 代码完成消息的发送与消费，跑通“第一个消息闭环”。</p></div><h2 id="背景-为什么从-跑通-开始" tabindex="-1"><a class="header-anchor" href="#背景-为什么从-跑通-开始"><span>背景：为什么从“跑通”开始？</span></a></h2><p>在学习 RocketMQ 时，经常会陷入两个极端：</p><ul><li>一上来就读源码、看架构图，结果“懂了概念，写不出代码”</li><li>或者只停留在 <code>mqadmin</code> 命令，不了解 Java 客户端如何工作</li></ul><p><strong>正确的学习路径应该是：</strong></p><blockquote><p>先跑通 → 再理解 → 后优化 → 最终掌控</p></blockquote><p>本文就是这条路径的第一步。</p><h2 id="环境准备" tabindex="-1"><a class="header-anchor" href="#环境准备"><span>环境准备</span></a></h2><h3 id="本地环境要求" tabindex="-1"><a class="header-anchor" href="#本地环境要求"><span>本地环境要求</span></a></h3><table><thead><tr><th>组件</th><th>版本</th></tr></thead><tbody><tr><td>OS</td><td>macOS / Linux / Windows</td></tr><tr><td>JDK</td><td>8+</td></tr><tr><td>Maven</td><td>3.6+</td></tr><tr><td>RocketMQ</td><td>5.x（本文以 5.2.0 为例）</td></tr></tbody></table><h3 id="下载并启动" tabindex="-1"><a class="header-anchor" href="#下载并启动"><span>下载并启动</span></a></h3><h4 id="二进制" tabindex="-1"><a class="header-anchor" href="#二进制"><span>二进制</span></a></h4><p>1] 下载</p><details class="hint-container details"><summary>下载二进制包</summary><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token function">wget</span> https://dist.apache.org/repos/dist/release/rocketmq/5.2.0/rocketmq-all-5.2.0-bin-release.zip</span>
<span class="line"><span class="token function">unzip</span> rocketmq-all-5.2.0-bin-release.zip</span>
<span class="line"><span class="token builtin class-name">cd</span> rocketmq-all-5.2.0-bin-release</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>2] 启动 NameServer</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token function">nohup</span> <span class="token function">sh</span> bin/mqnamesrv <span class="token operator">&amp;</span></span>
<span class="line"><span class="token function">tail</span> <span class="token parameter variable">-f</span> ~/logs/rocketmqlogs/namesrv.log</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>看到如下日志说明启动成功：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">The Name Server boot success...</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>3] 启动 Broker</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token function">nohup</span> <span class="token function">sh</span> bin/mqbroker <span class="token parameter variable">-n</span> localhost:9876 --enable-proxy <span class="token operator">&amp;</span></span>
<span class="line"><span class="token function">tail</span> <span class="token parameter variable">-f</span> ~/logs/rocketmqlogs/broker.log</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>看到如下日志说明启动成功：</p><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">The broker[broker-a, 192.168.x.x:10911] boot success...</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p><strong>关键点</strong></p><ul><li>NameServer 端口：<code>9876</code></li><li>Broker 默认端口：<code>10911</code></li><li>必须先启动 NameServer，再启动 Broker</li></ul><h4 id="docker" tabindex="-1"><a class="header-anchor" href="#docker"><span>Docker</span></a></h4><p>1] centos yum源配置</p><details class="hint-container details"><summary>配置阿里云yum镜像源</summary><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token builtin class-name">cd</span> /etc/yum.repos.d/</span>
<span class="line"></span>
<span class="line"><span class="token function">mkdir</span> backup</span>
<span class="line"><span class="token function">mv</span> /etc/yum.repos.d/* /etc/yum.repos.d/backup/</span>
<span class="line"><span class="token comment"># 下载aliyun 的yum源配置</span></span>
<span class="line"><span class="token function">curl</span> <span class="token parameter variable">-o</span> /etc/yum.repos.d/CentOS-Base.repo https://mirrors.aliyun.com/repo/Centos-7.repo</span>
<span class="line"></span>
<span class="line">yum clean all</span>
<span class="line">yum makecache</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>2] 安装 Docker 和 Docker Compose</p><details class="hint-container details"><summary>安装 Docker 和 Docker Compose</summary><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token comment"># 1) 卸载旧版（新机器可跳过）</span></span>
<span class="line"><span class="token function">sudo</span> yum remove <span class="token parameter variable">-y</span> <span class="token function">docker</span> docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 2) 装依赖</span></span>
<span class="line"><span class="token function">sudo</span> yum <span class="token function">install</span> <span class="token parameter variable">-y</span> yum-utils</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 3) 用阿里云镜像源（比官方快）</span></span>
<span class="line"><span class="token function">sudo</span> yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 4) 安装 Docker</span></span>
<span class="line"><span class="token function">sudo</span> yum <span class="token function">install</span> <span class="token parameter variable">-y</span> docker-ce docker-ce-cli containerd.io docker-compose-plugin</span>
<span class="line"></span>
<span class="line"><span class="token comment"># 5) 启动并开机自启</span></span>
<span class="line"><span class="token function">sudo</span> systemctl start <span class="token function">docker</span></span>
<span class="line"><span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 6) 验证</span></span>
<span class="line"><span class="token function">docker</span> <span class="token parameter variable">--version</span></span>
<span class="line"><span class="token function">docker</span> compose version   <span class="token comment"># 注意：新版是 docker compose（无横线）</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 7) 配置国内镜像加速</span></span>
<span class="line"><span class="token function">sudo</span> <span class="token function">mkdir</span> <span class="token parameter variable">-p</span> /etc/docker</span>
<span class="line"><span class="token function">sudo</span> <span class="token function">tee</span> /etc/docker/daemon.json <span class="token operator">&lt;&lt;</span><span class="token string">&#39;EOF&#39;</span>
<span class="line">{</span>
<span class="line">  &quot;registry-mirrors&quot;: [&quot;https://docker.m.daocloud.io&quot;]</span>
<span class="line">}</span>
<span class="line">EOF</span></span>
<span class="line"><span class="token function">sudo</span> systemctl restart <span class="token function">docker</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><p>3] 安装 RocketMQ</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token function">mkdir</span> <span class="token parameter variable">-p</span> /usr/local/rocketmq/<span class="token punctuation">{</span>namesrv/logs,broker/logs,broker/store,broker/conf<span class="token punctuation">}</span></span>
<span class="line"><span class="token builtin class-name">cd</span> /usr/local/rocketmq</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><details class="hint-container details"><summary>broker.conf</summary><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token function">cat</span> <span class="token operator">&gt;</span> broker/conf/broker.conf <span class="token operator">&lt;&lt;</span><span class="token string">&#39;EOF&#39;</span>
<span class="line">brokerClusterName=DefaultCluster</span>
<span class="line">brokerName=broker-a</span>
<span class="line">brokerId=0</span>
<span class="line">namesrvAddr=rmqnamesrv:9876</span>
<span class="line">brokerIP1=192.168.229.130</span>
<span class="line">listenPort=10911</span>
<span class="line">deleteWhen=04</span>
<span class="line">fileReservedTime=48</span>
<span class="line">brokerRole=ASYNC_MASTER</span>
<span class="line">flushDiskType=ASYNC_FLUSH</span>
<span class="line">autoCreateTopicEnable=true</span>
<span class="line">autoCreateSubscriptionGroup=true</span>
<span class="line"></span>
<span class="line"># 关键：显式指定存储路径（防止 ScheduleMessageService 拿不到默认路径）</span>
<span class="line">storePathRootDir=/home/rocketmq/store</span>
<span class="line">storePathCommitLog=/home/rocketmq/store/commitlog</span>
<span class="line">storePathDelayQueue=/home/rocketmq/store/delayqueue</span>
<span class="line">mapedFileSizeCommitLog=1073741824</span>
<span class="line">mapedFileSizeConsumeQueue=300000</span>
<span class="line">destroyMapedFileIntervalForcibly=120000</span>
<span class="line">redeleteHangedFileInterval=120000</span>
<span class="line">diskMaxUsedSpaceRatio=88</span>
<span class="line">EOF</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><details class="hint-container details"><summary>docker-compose.yml</summary><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token function">cat</span> <span class="token operator">&gt;</span> docker-compose.yml <span class="token operator">&lt;&lt;</span><span class="token string">&#39;EOF&#39;</span>
<span class="line">version: &#39;3.8&#39;</span>
<span class="line"></span>
<span class="line">services:</span>
<span class="line">  namesrv:</span>
<span class="line">    image: apache/rocketmq:5.3.2</span>
<span class="line">    container_name: rmqnamesrv</span>
<span class="line">    ports:</span>
<span class="line">      - &quot;9876:9876&quot;</span>
<span class="line">    environment:</span>
<span class="line">      JAVA_OPT_EXT: &quot;-Xms64m -Xmx64m&quot;</span>
<span class="line">    volumes:</span>
<span class="line">      - ./namesrv/logs:/home/rocketmq/logs</span>
<span class="line">    command: sh mqnamesrv</span>
<span class="line">    mem_limit: 200m</span>
<span class="line">    networks:</span>
<span class="line">      - rocketmq</span>
<span class="line">    restart: unless-stopped</span>
<span class="line"></span>
<span class="line">  broker:</span>
<span class="line">    image: apache/rocketmq:5.3.2</span>
<span class="line">    container_name: rmqbroker</span>
<span class="line">    ports:</span>
<span class="line">      - &quot;10909:10909&quot;</span>
<span class="line">      - &quot;10911:10911&quot;</span>
<span class="line">      - &quot;10912:10912&quot;</span>
<span class="line">    environment:</span>
<span class="line">      NAMESRV_ADDR: &quot;rmqnamesrv:9876&quot;</span>
<span class="line">      JAVA_OPT_EXT: &quot;-Xms128m -Xmx128m -Xmn64m&quot;</span>
<span class="line">    volumes:</span>
<span class="line">      - ./broker/logs:/home/rocketmq/logs</span>
<span class="line">      - ./broker/store:/home/rocketmq/store</span>
<span class="line">      - ./broker/conf/broker.conf:/home/rocketmq/rocketmq-5.3.2/conf/broker.conf</span>
<span class="line">    command: sh mqbroker -c /home/rocketmq/rocketmq-5.3.2/conf/broker.conf</span>
<span class="line">    depends_on:</span>
<span class="line">      - namesrv</span>
<span class="line">    mem_limit: 400m</span>
<span class="line">    networks:</span>
<span class="line">      - rocketmq</span>
<span class="line">    restart: unless-stopped</span>
<span class="line"></span>
<span class="line">  dashboard:</span>
<span class="line">    image: apacherocketmq/rocketmq-dashboard:1.0.0</span>
<span class="line">    container_name: rmqdashboard</span>
<span class="line">    ports:</span>
<span class="line">      - &quot;8082:8080&quot;</span>
<span class="line">    environment:</span>
<span class="line">      JAVA_OPTS: &quot;-Drocketmq.namesrv.addr=rmqnamesrv:9876 -Dserver.port=8080 -Xms64m -Xmx64m -Xmn32m&quot;</span>
<span class="line">    depends_on:</span>
<span class="line">      - namesrv</span>
<span class="line">    mem_limit: 200m</span>
<span class="line">    restart: unless-stopped</span>
<span class="line">    networks:</span>
<span class="line">      - rocketmq</span>
<span class="line"></span>
<span class="line">networks:</span>
<span class="line">  rocketmq:</span>
<span class="line">    driver: bridge</span>
<span class="line">EOF</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token comment"># 修改权限</span></span>
<span class="line"><span class="token function">chmod</span> <span class="token parameter variable">-R</span> <span class="token number">777</span> broker/store</span>
<span class="line"><span class="token function">chmod</span> <span class="token parameter variable">-R</span> <span class="token number">777</span> broker/logs</span>
<span class="line"><span class="token function">chown</span> <span class="token parameter variable">-R</span> <span class="token number">1000</span>:1000 broker/store</span>
<span class="line"><span class="token function">chown</span> <span class="token parameter variable">-R</span> <span class="token number">1000</span>:1000 broker/log</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>4] 操作RocketMQ</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token builtin class-name">cd</span> /usr/local/rocketmq</span>
<span class="line"><span class="token comment"># 启动</span></span>
<span class="line"><span class="token function">docker</span> compose up <span class="token parameter variable">-d</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 关闭</span></span>
<span class="line"><span class="token function">docker</span> compose down</span>
<span class="line"></span>
<span class="line"><span class="token comment">#查看状态</span></span>
<span class="line"><span class="token function">docker</span> compose <span class="token function">ps</span></span>
<span class="line"><span class="token function">docker</span> stats   <span class="token comment"># 看内存占用，虚拟机小可下调 JAVA_OPT_EXT</span></span>
<span class="line"></span>
<span class="line"><span class="token comment"># 关闭dashboard，内存不够任意卡顿</span></span>
<span class="line"><span class="token function">docker</span> stop rmqdashboard</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>5] 验证是否真的启动</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token comment"># NameServer 日志</span></span>
<span class="line"><span class="token function">docker</span> logs rmqnamesrv <span class="token operator">|</span> <span class="token function">tail</span> <span class="token parameter variable">-20</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>​ 看到 <code>The Name Server boot success</code> 即 OK</p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code class="language-bash"><span class="line"><span class="token comment"># Broker 注册</span></span>
<span class="line"><span class="token function">docker</span> <span class="token builtin class-name">exec</span> rmqbroker <span class="token function">sh</span> <span class="token parameter variable">-c</span> <span class="token string">&quot;sh mqadmin clusterList -n rmqnamesrv:9876&quot;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>​ 能看到 <code>broker-a</code> 在线即成功</p><p>​</p><p>注意：如果安装了dashboard，可以访问 http://192.168.229.130:8082来验证是否安装成功</p><h2 id="java-客户端实战-消息收发最小闭环" tabindex="-1"><a class="header-anchor" href="#java-客户端实战-消息收发最小闭环"><span>Java 客户端实战：消息收发最小闭环</span></a></h2><h3 id="maven-依赖" tabindex="-1"><a class="header-anchor" href="#maven-依赖"><span>Maven 依赖</span></a></h3><div class="language-xml line-numbers-mode" data-highlighter="prismjs" data-ext="xml"><pre><code class="language-xml"><span class="line"><span class="token comment">&lt;!-- RocketMQ Client --&gt;</span></span>
<span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>dependency</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>groupId</span><span class="token punctuation">&gt;</span></span>org.apache.rocketmq<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>groupId</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>artifactId</span><span class="token punctuation">&gt;</span></span>rocketmq-client<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>artifactId</span><span class="token punctuation">&gt;</span></span></span>
<span class="line">    <span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>version</span><span class="token punctuation">&gt;</span></span>5.1.0<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>version</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"><span class="token tag"><span class="token tag"><span class="token punctuation">&lt;/</span>dependency</span><span class="token punctuation">&gt;</span></span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="生产者-producer" tabindex="-1"><a class="header-anchor" href="#生产者-producer"><span>生产者（Producer）</span></a></h3><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java"><pre><code class="language-java"><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">OrderProducer</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">MQClientException</span><span class="token punctuation">,</span> <span class="token class-name">MQBrokerException</span><span class="token punctuation">,</span> <span class="token class-name">RemotingException</span><span class="token punctuation">,</span> <span class="token class-name">InterruptedException</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 1. 创建 Producer，指定 Producer Group（对应业务：下单系统）</span></span>
<span class="line">        <span class="token class-name">DefaultMQProducer</span> producer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">DefaultMQProducer</span><span class="token punctuation">(</span><span class="token string">&quot;order_producer_group&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 2. 指定 NameServer 地址（找前台问地址）</span></span>
<span class="line">        producer<span class="token punctuation">.</span><span class="token function">setNamesrvAddr</span><span class="token punctuation">(</span><span class="token string">&quot;192.168.229.130:9876&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 3. 启动 Producer</span></span>
<span class="line">        producer<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;Producer 启动成功&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 4. 构造消息（业务事件：OrderCreated）</span></span>
<span class="line">        <span class="token comment">// Topic = 事件名，Tag = 事件子类型，Body = 业务数据</span></span>
<span class="line">        <span class="token class-name">Message</span> msg <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Message</span><span class="token punctuation">(</span></span>
<span class="line">                <span class="token string">&quot;order_created_topic&quot;</span><span class="token punctuation">,</span>          <span class="token comment">// Topic：订单创建事件</span></span>
<span class="line">                <span class="token string">&quot;ORDER_CREATED&quot;</span><span class="token punctuation">,</span>               <span class="token comment">// Tag：事件类型</span></span>
<span class="line">                <span class="token string">&quot;{\\&quot;orderId\\&quot;:\\&quot;1001\\&quot;,\\&quot;userId\\&quot;:88,\\&quot;amount\\&quot;:299.00}&quot;</span><span class="token punctuation">.</span><span class="token function">getBytes</span><span class="token punctuation">(</span><span class="token punctuation">)</span></span>
<span class="line">        <span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 5. 发送消息</span></span>
<span class="line">        <span class="token class-name">SendResult</span> result <span class="token operator">=</span> producer<span class="token punctuation">.</span><span class="token function">send</span><span class="token punctuation">(</span>msg<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;消息发送成功：&quot;</span> <span class="token operator">+</span> result<span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 6. 关闭 Producer（实际生产中常驻内存，这里为了Demo）</span></span>
<span class="line">        producer<span class="token punctuation">.</span><span class="token function">shutdown</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="消费者-consumer" tabindex="-1"><a class="header-anchor" href="#消费者-consumer"><span>消费者（Consumer）</span></a></h3><div class="language-java line-numbers-mode" data-highlighter="prismjs" data-ext="java"><pre><code class="language-java"><span class="line"><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">LogConsumer</span> <span class="token punctuation">{</span></span>
<span class="line">    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token keyword">throws</span> <span class="token class-name">MQClientException</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token comment">// 1. 创建 Consumer，指定 Consumer Group（对应业务：日志系统）</span></span>
<span class="line">        <span class="token class-name">DefaultMQPushConsumer</span> consumer <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">DefaultMQPushConsumer</span><span class="token punctuation">(</span><span class="token string">&quot;log_consumer_group&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 2. 指定 NameServer 地址</span></span>
<span class="line">        consumer<span class="token punctuation">.</span><span class="token function">setNamesrvAddr</span><span class="token punctuation">(</span><span class="token string">&quot;192.168.229.130:9876&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 3. 订阅 Topic（关心订单创建事件）</span></span>
<span class="line">        <span class="token comment">// 第二个参数：* 表示订阅所有 Tag</span></span>
<span class="line">        consumer<span class="token punctuation">.</span><span class="token function">subscribe</span><span class="token punctuation">(</span><span class="token string">&quot;order_created_topic&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;*&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 4. 注册监听器（处理业务逻辑）</span></span>
<span class="line">        consumer<span class="token punctuation">.</span><span class="token function">registerMessageListener</span><span class="token punctuation">(</span><span class="token keyword">new</span> <span class="token class-name">MessageListenerConcurrently</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">            <span class="token annotation punctuation">@Override</span></span>
<span class="line">            <span class="token keyword">public</span> <span class="token class-name">ConsumeConcurrentlyStatus</span> <span class="token function">consumeMessage</span><span class="token punctuation">(</span></span>
<span class="line">                    <span class="token class-name">List</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token class-name">MessageExt</span><span class="token punctuation">&gt;</span></span> msgs<span class="token punctuation">,</span></span>
<span class="line">                    <span class="token class-name">ConsumeConcurrentlyContext</span> context<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line"></span>
<span class="line">                <span class="token keyword">for</span> <span class="token punctuation">(</span><span class="token class-name">MessageExt</span> msg <span class="token operator">:</span> msgs<span class="token punctuation">)</span> <span class="token punctuation">{</span></span>
<span class="line">                    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;日志系统收到消息：&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;Topic:&quot;</span> <span class="token operator">+</span> msg<span class="token punctuation">.</span><span class="token function">getTopic</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;Tag:&quot;</span> <span class="token operator">+</span> msg<span class="token punctuation">.</span><span class="token function">getTags</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                    <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;Body:&quot;</span> <span class="token operator">+</span> <span class="token keyword">new</span> <span class="token class-name">String</span><span class="token punctuation">(</span>msg<span class="token punctuation">.</span><span class="token function">getBody</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">                <span class="token punctuation">}</span></span>
<span class="line"></span>
<span class="line">                <span class="token comment">// 返回消费成功</span></span>
<span class="line">                <span class="token keyword">return</span> <span class="token class-name">ConsumeConcurrentlyStatus</span><span class="token punctuation">.</span><span class="token constant">CONSUME_SUCCESS</span><span class="token punctuation">;</span></span>
<span class="line">            <span class="token punctuation">}</span></span>
<span class="line">        <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line"></span>
<span class="line">        <span class="token comment">// 5. 启动 Consumer</span></span>
<span class="line">        consumer<span class="token punctuation">.</span><span class="token function">start</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">        <span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;Consumer 启动成功，等待消息...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="启动顺序" tabindex="-1"><a class="header-anchor" href="#启动顺序"><span>启动顺序</span></a></h3><ul><li><strong>启动 Docker 容器</strong>（NameServer → Broker）</li><li><strong>运行 <code>LogConsumer</code></strong>（先启动消费者，相当于“值班”）</li><li><strong>运行 <code>OrderProducer</code></strong>（发送消息）</li><li>观察 <code>LogConsumer</code> 控制台是否打印消息</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">Consumer 启动成功，等待消息...</span>
<span class="line">日志系统收到消息：</span>
<span class="line">Topic:order_created_topic</span>
<span class="line">Tag:ORDER_CREATED</span>
<span class="line">Body:{&quot;orderId&quot;:&quot;1001&quot;,&quot;userId&quot;:88,&quot;amount&quot;:299.00}</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="核心概念速览" tabindex="-1"><a class="header-anchor" href="#核心概念速览"><span>核心概念速览</span></a></h2><table><thead><tr><th>概念</th><th>作用</th></tr></thead><tbody><tr><td>NameServer</td><td>服务注册与发现（类似注册中心）</td></tr><tr><td>Broker</td><td>消息存储与投递</td></tr><tr><td>Producer</td><td>消息发送方</td></tr><tr><td>Consumer</td><td>消息消费方</td></tr><tr><td>Topic</td><td>消息主题（分类）</td></tr><tr><td>Tag</td><td>消息子标签（过滤）</td></tr><tr><td>Group</td><td>生产/消费集群标识</td></tr></tbody></table><h2 id="常见问题与排查" tabindex="-1"><a class="header-anchor" href="#常见问题与排查"><span>常见问题与排查</span></a></h2><h3 id="连接不上-nameserver" tabindex="-1"><a class="header-anchor" href="#连接不上-nameserver"><span>连接不上 NameServer</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">RemotingConnectException: connect to &lt;null&gt; failed</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>检查：</p><ul><li><code>setNamesrvAddr</code> 是否正确</li><li>NameServer 是否启动</li><li>防火墙是否放行 9876</li></ul><h3 id="topic-不存在" tabindex="-1"><a class="header-anchor" href="#topic-不存在"><span>Topic 不存在</span></a></h3><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">CODE: 17 DESC: topic does not exist</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>解决：</p><ul><li>自动创建 Topic（Broker 默认开启）</li><li>或手动创建：</li></ul><div class="language-text line-numbers-mode" data-highlighter="prismjs" data-ext="text"><pre><code class="language-text"><span class="line">sh bin/mqadmin updatetopic -n localhost:9876 -t QuickStartTopic -c DefaultCluster</span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h3 id="消费者不消费" tabindex="-1"><a class="header-anchor" href="#消费者不消费"><span>消费者不消费</span></a></h3><p>检查：</p><ul><li>Topic 名称是否一致</li><li>ConsumerGroup 是否重复</li><li>订阅表达式是否正确（<code>*</code> 表示订阅所有 Tag）</li></ul><h2 id="生产环境提醒" tabindex="-1"><a class="header-anchor" href="#生产环境提醒"><span>生产环境提醒</span></a></h2><p>本文是 <strong>本地开发环境</strong>，生产环境还需关注：</p><ul><li>Broker 集群部署</li><li>NameServer 高可用</li><li>消息持久化与刷盘策略</li><li>消费幂等</li><li>消息重试与死信队列</li><li>监控与告警</li></ul><p>这些内容将在后续文章中逐步展开。</p><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2><blockquote><p>本文完成了 RocketMQ 使用的“第一步”：</p><p><strong>本地搭建 NameServer + Broker → 客户端发送消息 → 消费者接收消息</strong>。</p><p>这一步虽然简单，却是理解 RocketMQ 架构、消息流转、客户端原理的基础。</p></blockquote>`,75)]])}var s=r(a,[[`render`,o]]);export{i as _pageData,s as default};