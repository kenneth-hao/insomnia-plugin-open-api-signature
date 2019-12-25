Insomnia Plugin 支持自动接口数字签名

已支持自动拦截的路由为 `/open/i/**`, 如需拦截其他路由，请自行配置源码开头的正则。


### Install

> 客户端版本：6.3.2（理论上无要求）

> 直接 clone 到插件根目录即可

### Usage

> Plugin 实现主要是通过拦截 `指定规则的路由`, 并读取 `Environment` 变量中的 `app_sign_key` 来自动计算 & 添加 `sign` 参数.

举个栗子

配置 `Sub Environments`， 选定 `Activate Environment`

```json
{
    "demo": {
        "open_platform": {
            "app_sign_key": "xxxxxxxxxxx"
        }
    }
}
```

配置 `Folder` 的 `Environment` 

```json
{
    "app_sign_key": "{{ demo.open_platform.app_sign_key  }}"
}
```