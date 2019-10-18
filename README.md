# 需要在main.js引用改文件

```js
import('@/common/wxsdk')
```



```js
import WXSDK from '@/common/wxsdk';
WXSDK.chooseImage().then(res => {
    // 本地图片Ids
});
await WXSDK.uploadImage(this.src); // 上传到微信服务器
```

