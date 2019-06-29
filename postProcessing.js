/**
 *  @desc 后置处理 fix ES Module type=module cause "parcelRequire is not defined" error
 *  给生成的index.js 文件 parcelRequire 添加 var 声明
 *  see more: https://github.com/parcel-bundler/parcel/issues/1401
 * 
 *  bug2:  Uncaught ReferenceError: regeneratorRuntime
 *    https://github.com/parcel-bundler/parcel/issues/1762
 *    see more: https://github.com/parcel-bundler/parcel/issues/1762#issuecomment-487406876
 * */

const fs = require('fs');
const path = './dist/wxa/index.js';

fs.readFile(path, 'utf8', (err, data) => {
  if (err) throw err;
  // console.log(data);
  WriteFile(path, `var ${data}`);
});

function WriteFile (path, data) {
  fs.writeFile(path, data, (err) => {
    if (err) throw err;
    console.log('write success dist/wxa/index.js');
  });
}